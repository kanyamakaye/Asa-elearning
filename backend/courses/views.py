from io import BytesIO

from django.contrib.auth import get_user_model
from django.http import Http404, HttpResponse
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.permissions import CanManageCourse, CanManageCourseContent, IsInstructorOrReadOnly
from certificates.rendering import render_sample_certificate_image
from common.responses import StandardResponseMixin, success_response
from enrollments.models import Enrollment

from .models import Course, CourseCategory, CourseInstructor, CourseModule, CourseUnit
from .serializers import (
    CourseCategorySerializer,
    CourseDetailSerializer,
    CourseInstructorSerializer,
    CourseLearnSerializer,
    CourseListSerializer,
    CourseModuleSerializer,
    CourseUnitDetailSerializer,
    CourseUnitSerializer,
)


class CourseCategoryViewSet(viewsets.ModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsInstructorOrReadOnly]
    lookup_field = 'slug'
    search_fields = ['name', 'description']


class CourseViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Course.objects.select_related('category', 'instructor').all()
    permission_classes = [CanManageCourse]
    lookup_field = 'slug'
    create_message = 'Course created successfully.'
    update_message = 'Course updated successfully.'
    delete_message = 'Course deleted successfully.'
    search_fields = ['title', 'description', 'course_code']
    ordering_fields = ['created_at', 'price', 'title']

    def get_serializer_class(self):
        return CourseDetailSerializer if self.action in ('retrieve', 'create', 'update', 'partial_update') else CourseListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        is_free = self.request.query_params.get('is_free')
        instructor = self.request.query_params.get('instructor')

        if self.action == 'list' and not status_param:
            qs = qs.filter(status=Course.Status.PUBLISHED)
        if status_param:
            qs = qs.filter(status=status_param)
        if category:
            qs = qs.filter(category__slug=category)
        if level:
            qs = qs.filter(level=level)
        if is_free is not None:
            qs = qs.filter(is_free=is_free.lower() == 'true')
        if instructor:
            qs = qs.filter(instructor_id=instructor)
        return qs

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'])
    def modules(self, request, slug=None):
        course = self.get_object()
        modules = CourseModule.objects.filter(unit__course=course).select_related('unit')
        serializer = CourseModuleSerializer(modules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def units(self, request, slug=None):
        course = self.get_object()
        serializer = CourseUnitDetailSerializer(course.units.prefetch_related('modules'), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def learn(self, request, slug=None):
        """Full lesson content for the student learning view — gated to
        enrolled students (or the owning/co-instructor and course managers,
        so they can preview what students see)."""
        course = self.get_object()
        user = request.user
        is_manager = user.is_staff or user.user_type in ('admin', 'academic_manager', 'content_manager')
        is_instructor = course.instructor_id == user.id or CourseInstructor.objects.filter(
            course=course, instructor=user,
        ).exists()
        is_enrolled = Enrollment.objects.filter(student=user, course=course).exists()
        if not (is_manager or is_instructor or is_enrolled):
            raise PermissionDenied('Enroll in this course to access its lessons.')
        context = self.get_serializer_context()
        context['bypass_sequential_lock'] = is_manager or is_instructor
        serializer = CourseLearnSerializer(course, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-courses', permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        qs = self.get_queryset().filter(instructor=request.user)
        serializer = CourseListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        """Public platform-wide counters for the marketing homepage's hero
        stat strip (course/student/instructor counts, completion rate) —
        previously hardcoded copy on the frontend."""
        User = get_user_model()
        published = Course.objects.filter(status=Course.Status.PUBLISHED)
        total_enrollments = Enrollment.objects.count()
        completed_enrollments = Enrollment.objects.filter(status=Enrollment.Status.COMPLETED).count()
        return Response({
            'course_count': published.count(),
            'student_count': Enrollment.objects.values('student').distinct().count(),
            'instructor_count': User.objects.filter(
                user_type=User.UserType.INSTRUCTOR, courses_taught__status=Course.Status.PUBLISHED,
            ).distinct().count(),
            'completion_rate': round((completed_enrollments / total_enrollments) * 100) if total_enrollments else 0,
        })

    @action(detail=True, methods=['get'], url_path='certificate-sample', permission_classes=[permissions.AllowAny])
    def certificate_sample(self, request, slug=None):
        """A watermarked preview of the certificate this course awards, so a
        prospective student can see what they'll earn before enrolling."""
        course = self.get_object()
        if not course.certificate_enabled:
            raise Http404('This course does not award a certificate.')
        img = render_sample_certificate_image(course)
        buffer = BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        response = HttpResponse(buffer.getvalue(), content_type='image/png')
        response['Cache-Control'] = 'public, max-age=86400'
        return response

    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        course = self.get_object()
        course.status = Course.Status.PUBLISHED
        course.published_at = timezone.now()
        course.save(update_fields=['status', 'published_at'])
        return success_response(CourseDetailSerializer(course, context=self.get_serializer_context()).data, 'Course published successfully.')

    @action(detail=True, methods=['post'])
    def archive(self, request, slug=None):
        course = self.get_object()
        course.status = Course.Status.ARCHIVED
        course.save(update_fields=['status'])
        return success_response(CourseDetailSerializer(course, context=self.get_serializer_context()).data, 'Course archived successfully.')


class CourseUnitViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = CourseUnit.objects.select_related('course').all()
    serializer_class = CourseUnitSerializer
    permission_classes = [CanManageCourseContent]
    create_message = 'Unit created successfully.'
    update_message = 'Unit updated successfully.'
    delete_message = 'Unit deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


class CourseModuleViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = CourseModule.objects.select_related('unit', 'unit__course').all()
    serializer_class = CourseModuleSerializer
    permission_classes = [CanManageCourseContent]
    create_message = 'Module created successfully.'
    update_message = 'Module updated successfully.'
    delete_message = 'Module deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        unit_id = self.request.query_params.get('unit')
        course_id = self.request.query_params.get('course')
        if unit_id:
            qs = qs.filter(unit_id=unit_id)
        if course_id:
            qs = qs.filter(unit__course_id=course_id)
        return qs


class CourseInstructorViewSet(viewsets.ModelViewSet):
    queryset = CourseInstructor.objects.select_related('instructor', 'course').all()
    serializer_class = CourseInstructorSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs
