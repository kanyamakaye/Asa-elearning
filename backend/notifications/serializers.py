from rest_framework import serializers

from .models import Announcement, Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message', 'reference_type',
            'reference_id', 'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            'id', 'course', 'title', 'message', 'created_by', 'audience_type', 'publish_date',
            'expiry_date', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
