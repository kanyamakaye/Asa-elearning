from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsInstructorOrReadOnly

from .models import Attendance, LiveSession
from .serializers import AttendanceSerializer, LiveSessionSerializer


class LiveSessionViewSet(viewsets.ModelViewSet):
    queryset = LiveSession.objects.select_related('instructor').all()
    serializer_class = LiveSessionSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        return qs.filter(course_id=course_id) if course_id else qs

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], url_path='check-in', permission_classes=[permissions.IsAuthenticated])
    def check_in(self, request, pk=None):
        session = self.get_object()
        attendance, _ = Attendance.objects.update_or_create(
            session=session,
            student=request.user,
            defaults={
                'course': session.course,
                'attendance_status': Attendance.Status.PRESENT,
                'check_in_time': timezone.now(),
            },
        )
        return Response(AttendanceSerializer(attendance).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related('student', 'session')
        session_id = self.request.query_params.get('session')
        if session_id:
            qs = qs.filter(session_id=session_id)
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
