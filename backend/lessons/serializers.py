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
    course_id = serializers.IntegerField(source='module.course.id', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'course_id', 'title', 'description', 'lesson_type', 'content',
            'content_url', 'video_url', 'duration_minutes', 'order', 'is_preview', 'status',
            'resources', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_module(self, value):
        request = self.context.get('request')
        user = request.user if request else None
        if user and not (user.is_staff or user.user_type in ('admin', 'academic_manager', 'content_manager')):
            if value.course.instructor_id != user.id:
                raise serializers.ValidationError('You can only manage content for your own courses.')
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field is required.')
        return value

    def validate(self, attrs):
        lesson_type = attrs.get('lesson_type', getattr(self.instance, 'lesson_type', None))
        video_url = attrs.get('video_url', getattr(self.instance, 'video_url', ''))
        if lesson_type == Lesson.LessonType.VIDEO and not video_url:
            raise serializers.ValidationError({'video_url': 'A video URL is required for video lessons.'})
        return attrs


class LessonCurriculumSerializer(serializers.ModelSerializer):
    """Public, pre-enrollment-safe view of a lesson for the course detail
    page's curriculum outline — metadata only. Deliberately excludes
    content/video_url/content_url so non-enrolled visitors can see what a
    course covers without being able to consume it (LessonViewSet itself is
    locked to course managers, so this is the only lesson data the public
    course page can see)."""

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'lesson_type', 'duration_minutes', 'order', 'is_preview']
