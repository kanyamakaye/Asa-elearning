from django.utils import timezone
from rest_framework import permissions, viewsets

from accounts.permissions import IsAdminOrReadOnly

from .models import FAQ, Feedback, SupportTicket
from .serializers import FAQSerializer, FeedbackSerializer, SupportTicketSerializer


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = SupportTicket.objects.select_related('user', 'assigned_to')
        if user.user_type in ('admin', 'support_staff') or user.is_staff:
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('status') == SupportTicket.Status.RESOLVED:
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()


class FAQViewSet(viewsets.ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['question', 'answer', 'category']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.user_type in ('admin', 'content_manager')):
            return FAQ.objects.all()
        return FAQ.objects.filter(is_active=True)


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Feedback.objects.select_related('user')
        if user.user_type == 'admin' or user.is_staff:
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
