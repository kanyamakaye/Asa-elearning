from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(Q(sender=user) | Q(receiver=user)).select_related('sender', 'receiver')
        box = self.request.query_params.get('box')
        if box == 'inbox':
            qs = qs.filter(receiver=user)
        elif box == 'sent':
            qs = qs.filter(sender=user)
        with_user = self.request.query_params.get('with')
        if with_user:
            qs = qs.filter(Q(sender_id=with_user) | Q(receiver_id=with_user))
        return qs

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.receiver != request.user:
            return Response({'detail': 'Only the recipient can mark this as read.'}, status=403)
        message.is_read = True
        message.read_at = timezone.now()
        message.save(update_fields=['is_read', 'read_at'])
        return Response(MessageSerializer(message).data)
