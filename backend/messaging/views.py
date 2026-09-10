from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import Http404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification

from .authorization import can_message, get_allowed_contacts
from .models import Conversation, ConversationParticipant, Message
from .serializers import ContactSerializer, ConversationSerializer, MessageSerializer, StartConversationSerializer

User = get_user_model()


def _notify_new_message(conversation, sender, content):
    others = conversation.participants.exclude(user=sender).select_related('user')
    for participant in others:
        Notification.objects.create(
            user=participant.user,
            notification_type='message',
            title=f'New message from {sender.full_name}',
            message=content[:140],
            reference_type='conversation',
            reference_id=conversation.id,
        )


class ConversationViewSet(viewsets.ModelViewSet):
    """GET/POST conversations/ — list the user's conversations (search by
    participant name or message content), or start a new one.

    A conversation's own messages live under the nested ConversationMessagesView
    below, not here — list/retrieve on this viewset only return conversation
    summaries (other participant, last message preview, unread count)."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = Conversation.objects.filter(participants__user=user).distinct()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(participants__user__first_name__icontains=search)
                | Q(participants__user__last_name__icontains=search)
                | Q(participants__user__username__icontains=search)
                | Q(messages__content__icontains=search),
            ).distinct()
        return qs.prefetch_related('participants__user', 'messages').order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        serializer = StartConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient = User.objects.filter(pk=serializer.validated_data['recipient']).first()
        if not recipient:
            raise ValidationError({'recipient': 'Recipient not found.'})
        if not can_message(request.user, recipient):
            raise PermissionDenied('You are not permitted to message this user.')

        content = serializer.validated_data['message']

        # Reuse an existing one-to-one conversation between exactly these two
        # users instead of creating a duplicate (Messages spec §15).
        conversation = None
        candidates = Conversation.objects.filter(participants__user=request.user).filter(participants__user=recipient)
        for candidate in candidates:
            if candidate.participants.count() == 2:
                conversation = candidate
                break

        created = conversation is None
        if created:
            conversation = Conversation.objects.create()
            ConversationParticipant.objects.create(conversation=conversation, user=request.user, last_read_at=timezone.now())
            ConversationParticipant.objects.create(conversation=conversation, user=recipient)

        Message.objects.create(conversation=conversation, sender=request.user, content=content)
        conversation.save()  # bump updated_at
        ConversationParticipant.objects.filter(conversation=conversation, user=request.user).update(last_read_at=timezone.now())
        _notify_new_message(conversation, request.user, content)

        conversation.refresh_from_db()
        out = self.get_serializer(conversation)
        return Response(out.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ConversationMessagesView(APIView):
    """GET: latest N messages (paginated backwards via ?before=<message_id>).
    POST: send a message into an existing conversation. Both require the
    requester to already be a participant (Messages spec §16)."""

    permission_classes = [permissions.IsAuthenticated]
    PAGE_SIZE = 40

    def get_conversation(self, request, conversation_id):
        conversation = Conversation.objects.filter(
            pk=conversation_id, participants__user=request.user,
        ).first()
        if not conversation:
            raise NotFound('Conversation not found.')
        return conversation

    def get(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)
        qs = conversation.messages.select_related('sender').order_by('-created_at')
        before = request.query_params.get('before')
        if before:
            qs = qs.filter(pk__lt=before)
        page = list(qs[: self.PAGE_SIZE])
        has_more = len(page) == self.PAGE_SIZE and qs.filter(pk__lt=page[-1].pk).exists()
        page.reverse()
        return Response({'results': MessageSerializer(page, many=True).data, 'has_more': has_more})

    def post(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)
        content = (request.data.get('content') or '').strip()
        if not content:
            raise ValidationError({'content': 'Message cannot be empty.'})

        message = Message.objects.create(conversation=conversation, sender=request.user, content=content)
        conversation.save()  # bump updated_at so the conversation list re-sorts
        ConversationParticipant.objects.filter(conversation=conversation, user=request.user).update(last_read_at=timezone.now())
        _notify_new_message(conversation, request.user, content)

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkConversationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        participant = ConversationParticipant.objects.filter(
            conversation_id=conversation_id, user=request.user,
        ).first()
        if not participant:
            raise Http404
        participant.last_read_at = timezone.now()
        participant.save(update_fields=['last_read_at'])
        return Response({'detail': 'Conversation marked as read.'})


class UnreadMessageCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total = 0
        participations = ConversationParticipant.objects.filter(user=request.user).select_related('conversation')
        for participant in participations:
            qs = Message.objects.filter(conversation=participant.conversation).exclude(sender=request.user)
            if participant.last_read_at:
                qs = qs.filter(created_at__gt=participant.last_read_at)
            total += qs.count()
        return Response({'unread_count': total})


class ContactsView(generics.ListAPIView):
    """Role-scoped, searchable list of users the current user may start a
    new conversation with — used by the "New Message" recipient picker."""

    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = get_allowed_contacts(self.request.user)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search),
            )
        return qs.order_by('first_name', 'last_name')[:50]
