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
        if user.user_type == 'admin' or user.is_staff:
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
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['question', 'answer', 'category']


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
