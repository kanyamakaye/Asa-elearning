from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsInstructorOrReadOnly
from realtime.events import publish_to_user

from .models import Announcement, Notification
from .serializers import AnnouncementSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        if self.request.query_params.get('unread') == 'true':
            qs = qs.filter(is_read=False)
        return qs

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at'])
        # Syncs the badge on this user's OTHER open tabs/devices (see Realtime.md #11) —
        # the tab that made this request already updates itself from the HTTP response.
        publish_to_user(request.user.id, 'notification.read', {'id': notification.id})
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        ids = list(self.get_queryset().filter(is_read=False).values_list('id', flat=True))
        self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now())
        for notification_id in ids:
            publish_to_user(request.user.id, 'notification.read', {'id': notification_id})
        return Response({'detail': 'All notifications marked as read.'})


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsInstructorOrReadOnly]
    search_fields = ['title', 'message']

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if self.action == 'list':
            qs = qs.filter(status=Announcement.Status.PUBLISHED)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
