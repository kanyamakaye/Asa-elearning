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

    def validate_course(self, value):
        request = self.context.get('request')
        user = request.user if request else None
        if user and not (user.is_staff or user.user_type in ('admin', 'academic_manager', 'content_manager')):
            if value.instructor_id != user.id:
                raise serializers.ValidationError('You can only manage content for your own courses.')
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('This field is required.')
        return value


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
            'level', 'language', 'duration_hours', 'image', 'thumbnail', 'price', 'discount_price',
            'is_free', 'status', 'visibility', 'average_rating', 'enrolled_count',
            'certificate_enabled', 'created_at',
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
            'requirements', 'learning_objectives', 'modules', 'co_instructors', 'category_id',
            'published_at', 'updated_at',
        ]

    def validate_course_code(self, value):
        if not value:
            return value
        qs = Course.objects.filter(course_code__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This course code is already in use.')
        return value

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Must be at least 3 characters long.')
        return value

    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Must be greater than or equal to 0.')
        return value

    def validate(self, attrs):
        price = attrs.get('price', getattr(self.instance, 'price', None))
        discount_price = attrs.get('discount_price', getattr(self.instance, 'discount_price', None))
        if discount_price is not None and price is not None and discount_price > price:
            raise serializers.ValidationError({'discount_price': 'Cannot exceed the regular price.'})
        duration = attrs.get('duration_hours', getattr(self.instance, 'duration_hours', None))
        if duration is not None and duration <= 0:
            raise serializers.ValidationError({'duration_hours': 'Must be greater than 0.'})
        return attrs
