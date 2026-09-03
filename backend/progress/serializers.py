from django.utils import timezone
from rest_framework import serializers

from .models import LessonProgress


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'student', 'course', 'lesson', 'progress_percentage', 'is_completed',
            'started_at', 'completed_at', 'last_accessed_at', 'time_spent_seconds',
        ]
        read_only_fields = ['id', 'student', 'last_accessed_at']

    def update(self, instance, validated_data):
        if validated_data.get('is_completed') and not instance.is_completed:
            validated_data['completed_at'] = timezone.now()
            validated_data['progress_percentage'] = 100
        if not instance.started_at:
            validated_data['started_at'] = timezone.now()
        return super().update(instance, validated_data)
