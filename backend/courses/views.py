from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageCourse, CanManageCourseContent, IsInstructorOrReadOnly
from common.responses import StandardResponseMixin, success_response

from .models import Course, CourseCategory, CourseInstructor, CourseModule, CourseUnit
from .serializers import (
    CourseCategorySerializer,
    CourseDetailSerializer,
    CourseInstructorSerializer,
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

    @action(detail=False, methods=['get'], url_path='my-courses', permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        qs = self.get_queryset().filter(instructor=request.user)
        serializer = CourseListSerializer(qs, many=True)
        return Response(serializer.data)

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
