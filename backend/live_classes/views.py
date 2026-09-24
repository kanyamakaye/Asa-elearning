from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanScheduleLiveClass
from common.responses import StandardResponseMixin, success_response
from enrollments.models import Enrollment
from notifications.services import notify_enrolled_students

from .models import Attendance, LiveSession
from .serializers import AttendanceSerializer, LiveSessionSerializer


class LiveSessionViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = LiveSession.objects.select_related('instructor', 'course').all()
    serializer_class = LiveSessionSerializer
    permission_classes = [CanScheduleLiveClass]
    search_fields = ['title', 'description']
    create_message = 'Live class scheduled successfully.'
    update_message = 'Live class updated successfully.'
    delete_message = 'Live class deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # CanScheduleLiveClass opens every safe method to any authenticated
        # user (see accounts/permissions.py) — the real read scoping happens
        # here, same pattern as GroupPermission/get_queryset. Unscoped, a
        # student could list any course's session and read its jitsi_room
        # (the only thing gating who can join a public Jitsi room), not just
        # ones they're enrolled in.
        if user.is_authenticated and user.user_type == 'student' and not user.is_staff:
            qs = qs.filter(
                course__enrollments__student=user,
                course__enrollments__status__in=[Enrollment.Status.ACTIVE, Enrollment.Status.COMPLETED],
            ).distinct()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        session = serializer.save(instructor=self.request.user)
        notify_enrolled_students(
            session.course,
            notification_type='live_class_scheduled',
            title='New Live Class Scheduled',
            message=f'"{session.title}" has been scheduled in {session.course.title} on {session.scheduled_date}.',
            reference_type='live_class',
            reference_id=session.id,
        )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        qs = self.get_queryset().filter(
            status=LiveSession.Status.SCHEDULED, scheduled_date__gte=timezone.now().date()
        ).order_by('scheduled_date', 'start_time')
        return Response(LiveSessionSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        session = self.get_object()
        session.status = LiveSession.Status.CANCELLED
        session.save(update_fields=['status'])
        return success_response(LiveSessionSerializer(session).data, 'Live class cancelled successfully.')

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        session.status = LiveSession.Status.COMPLETED
        session.save(update_fields=['status'])
        return success_response(LiveSessionSerializer(session).data, 'Live class marked as completed.')

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
