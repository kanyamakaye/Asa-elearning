from rest_framework import serializers

from .models import LearningResource, Lesson


class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = [
            'id', 'course', 'lesson', 'title', 'resource_type', 'file', 'file_url', 'file_name',
            'file_size', 'mime_type', 'is_downloadable', 'uploaded_by', 'created_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    resources = LearningResourceSerializer(many=True, read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'course_id', 'title', 'description', 'lesson_type', 'content',
            'content_url', 'video_url', 'duration_minutes', 'order', 'is_preview', 'status',
            'resources', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
