from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsCourseInstructorOrReadOnly, IsInstructorOrReadOnly

from .models import Course, CourseCategory, CourseInstructor, CourseModule
from .serializers import (
    CourseCategorySerializer,
    CourseDetailSerializer,
    CourseInstructorSerializer,
    CourseListSerializer,
    CourseModuleSerializer,
)


class CourseCategoryViewSet(viewsets.ModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsInstructorOrReadOnly]
    lookup_field = 'slug'
    search_fields = ['name', 'description']


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('category', 'instructor').all()
    permission_classes = [IsInstructorOrReadOnly, IsCourseInstructorOrReadOnly]
    lookup_field = 'slug'
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
        serializer = CourseModuleSerializer(course.modules.all(), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-courses', permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        qs = self.get_queryset().filter(instructor=request.user)
        serializer = CourseListSerializer(qs, many=True)
        return Response(serializer.data)


class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
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
