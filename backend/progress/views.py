from django.utils import timezone
from rest_framework import permissions, viewsets

from .models import LessonProgress
from .serializers import LessonProgressSerializer


class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = LessonProgress.objects.select_related('lesson', 'course')
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            course_id = self.request.query_params.get('course')
            student_id = self.request.query_params.get('student')
            if course_id:
                qs = qs.filter(course_id=course_id)
            if student_id:
                qs = qs.filter(student_id=student_id)
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, started_at=timezone.now())
