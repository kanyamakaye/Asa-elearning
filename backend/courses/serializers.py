from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Course, CourseCategory, CourseInstructor, CourseModule

User = get_user_model()


class CourseCategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'course_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class CourseModuleSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)

    class Meta:
        model = CourseModule
        fields = ['id', 'course', 'title', 'description', 'order', 'status', 'lesson_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseInstructorSerializer(serializers.ModelSerializer):
    instructor = UserPublicSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(
        source='instructor',
        queryset=User.objects.filter(user_type='instructor'),
        write_only=True,
    )

    class Meta:
        model = CourseInstructor
        fields = ['id', 'course', 'instructor', 'instructor_id', 'instructor_role', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']


class CourseListSerializer(serializers.ModelSerializer):
    instructor = UserPublicSerializer(read_only=True)
    category = CourseCategorySerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'course_code', 'title', 'slug', 'short_description', 'category', 'instructor',
            'level', 'language', 'duration_hours', 'image', 'price', 'is_free', 'status',
            'average_rating', 'enrolled_count', 'certificate_enabled', 'created_at',
        ]

    def get_average_rating(self, obj):
        agg = obj.reviews.filter(status='approved').aggregate(avg=Avg('rating'))
        return round(agg['avg'], 2) if agg['avg'] else None


class CourseDetailSerializer(CourseListSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    co_instructors = CourseInstructorSerializer(source='course_instructors', many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=CourseCategory.objects.all(), write_only=True, required=False
    )

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + [
            'description', 'video_url', 'enrollment_limit', 'start_date', 'end_date',
            'modules', 'co_instructors', 'category_id', 'updated_at',
        ]
