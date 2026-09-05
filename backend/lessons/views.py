from rest_framework import viewsets

from accounts.permissions import CanManageCourseContent
from common.responses import StandardResponseMixin

from .models import LearningResource, Lesson
from .serializers import LearningResourceSerializer, LessonSerializer


class LessonViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related('module', 'module__unit', 'module__unit__course').all()
    serializer_class = LessonSerializer
    permission_classes = [CanManageCourseContent]
    search_fields = ['title', 'description']
    create_message = 'Lesson created successfully.'
    update_message = 'Lesson updated successfully.'
    delete_message = 'Lesson deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get('module')
        course_id = self.request.query_params.get('course')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if course_id:
            qs = qs.filter(module__unit__course_id=course_id)
        if self.request.query_params.get('preview_only') == 'true':
            qs = qs.filter(is_preview=True)
        return qs


class LearningResourceViewSet(viewsets.ModelViewSet):
    queryset = LearningResource.objects.select_related('course', 'lesson__module__unit', 'lesson__module__unit__course').all()
    serializer_class = LearningResourceSerializer
    permission_classes = [CanManageCourseContent]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        lesson_id = self.request.query_params.get('lesson')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
