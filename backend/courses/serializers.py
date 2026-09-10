from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from lessons.serializers import LessonCurriculumSerializer, LessonLearnSerializer

from .models import Course, CourseCategory, CourseInstructor, CourseModule, CourseUnit

User = get_user_model()


def prerequisite_id_chain_contains(course, target_id, hops=20):
    """Walks a course's prerequisite chain looking for target_id — used to
    reject a change that would create a cycle (A requires B requires A).
    `hops` is a defensive cap; the check itself is what keeps real chains
    from ever getting that long."""
    current = course
    for _ in range(hops):
        if current is None:
            return False
        if current.id == target_id:
            return True
        current = current.prerequisite
    return False


class CourseCategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'course_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class CourseModuleSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)
    course_id = serializers.IntegerField(source='unit.course_id', read_only=True)
    quiz_count = serializers.SerializerMethodField()

    class Meta:
        model = CourseModule
        fields = [
            'id', 'unit', 'course_id', 'title', 'description', 'order', 'status',
            'lesson_count', 'quiz_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_quiz_count(self, obj):
        return obj.quizzes.filter(status='published').count()

    def validate_unit(self, value):
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


class CourseUnitSerializer(serializers.ModelSerializer):
    module_count = serializers.IntegerField(source='modules.count', read_only=True)

    class Meta:
        model = CourseUnit
        fields = ['id', 'course', 'title', 'description', 'order', 'status', 'module_count', 'created_at']
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


class CourseModuleCurriculumSerializer(CourseModuleSerializer):
    """Adds a public, curriculum-safe lesson outline — used only when nesting
    modules into the course detail response (see CourseUnitDetailSerializer),
    not for the module CRUD endpoints. Only published lessons are listed."""

    lessons = serializers.SerializerMethodField()

    class Meta(CourseModuleSerializer.Meta):
        fields = CourseModuleSerializer.Meta.fields + ['lessons']

    def get_lessons(self, obj):
        qs = obj.lessons.filter(status='published').order_by('order', 'id')
        return LessonCurriculumSerializer(qs, many=True).data


class CourseUnitDetailSerializer(CourseUnitSerializer):
    modules = CourseModuleCurriculumSerializer(many=True, read_only=True)

    class Meta(CourseUnitSerializer.Meta):
        fields = CourseUnitSerializer.Meta.fields + ['modules']


class CourseModuleLearnSerializer(CourseModuleSerializer):
    """Same shape as CourseModuleCurriculumSerializer but with full lesson
    content — only ever reached through CourseViewSet.learn(), which checks
    enrollment before serializing."""

    lessons = serializers.SerializerMethodField()

    class Meta(CourseModuleSerializer.Meta):
        fields = CourseModuleSerializer.Meta.fields + ['lessons']

    def get_lessons(self, obj):
        qs = obj.lessons.filter(status='published').order_by('order', 'id')
        return LessonLearnSerializer(qs, many=True).data


class CourseUnitLearnSerializer(CourseUnitSerializer):
    modules = CourseModuleLearnSerializer(many=True, read_only=True)

    class Meta(CourseUnitSerializer.Meta):
        fields = CourseUnitSerializer.Meta.fields + ['modules']


class CourseLearnSerializer(serializers.ModelSerializer):
    """The gated "learn" view of a course: full lesson content instead of
    the public curriculum outline. See CourseViewSet.learn()."""

    instructor = UserPublicSerializer(read_only=True)
    units = CourseUnitLearnSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'certificate_enabled', 'sequential_progression', 'instructor', 'units']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        lessons = [
            lesson
            for unit in data['units']
            for module in unit['modules']
            for lesson in module['lessons']
        ]
        if not instance.sequential_progression or self.context.get('bypass_sequential_lock'):
            for lesson in lessons:
                lesson['locked'] = False
            return data

        request = self.context.get('request')
        completed_ids = set()
        if request and request.user.is_authenticated:
            from progress.models import LessonProgress
            completed_ids = set(
                LessonProgress.objects.filter(
                    student=request.user, course=instance, is_completed=True,
                ).values_list('lesson_id', flat=True)
            )

        # Global order across the whole course (units/modules are already
        # nested in their own order) — the first lesson is always unlocked,
        # each next one unlocks only once its predecessor is completed.
        unlocked = True
        for lesson in lessons:
            lesson['locked'] = not unlocked
            if lesson['locked']:
                lesson['content'] = ''
                lesson['content_url'] = ''
                lesson['video_url'] = ''
                lesson['sections'] = []
                lesson['resources'] = []
            unlocked = unlocked and lesson['id'] in completed_ids
        return data


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
            'level', 'language', 'duration_hours', 'image', 'thumbnail', 'thumbnail_url', 'price', 'discount_price',
            'is_free', 'status', 'visibility', 'average_rating', 'enrolled_count',
            'certificate_enabled', 'created_at',
        ]

    def get_average_rating(self, obj):
        agg = obj.reviews.filter(status='approved').aggregate(avg=Avg('rating'))
        return round(agg['avg'], 2) if agg['avg'] else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # A pasted thumbnail_url is the intended "current" thumbnail even when
        # an uploaded file also exists (e.g. an auto-generated one from
        # seed_data) — every existing frontend read site already renders
        # `image`/`thumbnail` directly, so folding the override in here means
        # they pick it up with no template changes.
        if instance.thumbnail_url:
            data['image'] = instance.thumbnail_url
            data['thumbnail'] = instance.thumbnail_url
        return data


class CourseDetailSerializer(CourseListSerializer):
    units = CourseUnitDetailSerializer(many=True, read_only=True)
    co_instructors = CourseInstructorSerializer(source='course_instructors', many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=CourseCategory.objects.all(), write_only=True, required=False
    )

    prerequisite_title = serializers.CharField(source='prerequisite.title', read_only=True, default=None)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + [
            'description', 'video_url', 'enrollment_limit', 'prerequisite', 'prerequisite_title',
            'sequential_progression', 'start_date', 'end_date', 'requirements', 'learning_objectives',
            'units', 'co_instructors', 'category_id', 'published_at', 'updated_at',
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

        prerequisite = attrs.get('prerequisite', getattr(self.instance, 'prerequisite', None))
        if prerequisite and self.instance and prerequisite_id_chain_contains(prerequisite, self.instance.id):
            raise serializers.ValidationError({'prerequisite': 'This would create a prerequisite cycle.'})
        return attrs
