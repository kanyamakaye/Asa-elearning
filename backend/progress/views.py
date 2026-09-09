from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from certificates.models import Certificate
from certificates.rendering import generate_certificate_file
from enrollments.models import Enrollment
from enrollments.serializers import EnrollmentSerializer
from lessons.models import Lesson

from .models import LessonProgress
from .serializers import LessonProgressSerializer

# A student can download their certificate once they've cleared this much of
# the course, without needing to finish every last lesson — the enrollment
# itself still only flips to "completed" at 100%.
CERTIFICATE_THRESHOLD_PERCENT = 80


def _sync_enrollment_progress(student, course):
    """Recompute an Enrollment's completion_percentage from LessonProgress,
    mark it completed once every published lesson is done, and auto-issue a
    certificate as soon as the student crosses CERTIFICATE_THRESHOLD_PERCENT
    (independent of full completion). Returns the up-to-date
    EnrollmentSerializer data, or None if the student isn't (or is no longer)
    enrolled."""
    enrollment = Enrollment.objects.filter(student=student, course=course).first()
    if not enrollment:
        return None

    total = Lesson.objects.filter(module__unit__course=course, status=Lesson.Status.PUBLISHED).count()
    completed = LessonProgress.objects.filter(student=student, course=course, is_completed=True).count()
    percentage = round((completed / total) * 100, 2) if total else 0

    update_fields = []
    if enrollment.completion_percentage != percentage:
        enrollment.completion_percentage = percentage
        update_fields.append('completion_percentage')

    if total and completed >= total and enrollment.status != Enrollment.Status.COMPLETED:
        enrollment.status = Enrollment.Status.COMPLETED
        enrollment.completed_at = timezone.now()
        update_fields += ['status', 'completed_at']

    if (
        course.certificate_enabled
        and not enrollment.certificate_issued
        and total
        and percentage >= CERTIFICATE_THRESHOLD_PERCENT
    ):
        certificate, issued = Certificate.objects.get_or_create(
            student=student, course=course, defaults={'enrollment': enrollment},
        )
        if issued:
            generate_certificate_file(certificate)
            certificate.save(update_fields=['certificate_file'])
        enrollment.certificate_issued = True
        update_fields.append('certificate_issued')

    if update_fields:
        enrollment.save(update_fields=update_fields)
    return EnrollmentSerializer(enrollment).data


class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = LessonProgress.objects.select_related('lesson', 'course')
        course_id = self.request.query_params.get('course')
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            student_id = self.request.query_params.get('student')
            if course_id:
                qs = qs.filter(course_id=course_id)
            if student_id:
                qs = qs.filter(student_id=student_id)
            return qs
        qs = qs.filter(student=user)
        return qs.filter(course_id=course_id) if course_id else qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, started_at=timezone.now())

    @action(detail=False, methods=['post'])
    def complete(self, request):
        """Mark one lesson complete for the current student (get-or-create,
        idempotent) and roll the result up into the course enrollment's
        overall progress — this is what the Learn page's "Mark complete"
        button calls, instead of the caller having to know whether a
        LessonProgress row already exists to choose POST vs PATCH."""
        lesson = Lesson.objects.select_related('module__unit__course').filter(
            pk=request.data.get('lesson')
        ).first()
        if not lesson:
            raise ValidationError({'lesson': 'Lesson not found.'})
        course = lesson.course
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            raise PermissionDenied('You must be enrolled in this course to track progress.')

        now = timezone.now()
        progress, created = LessonProgress.objects.get_or_create(
            student=request.user, lesson=lesson,
            defaults={
                'course': course, 'is_completed': True, 'progress_percentage': 100,
                'started_at': now, 'completed_at': now,
            },
        )
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.progress_percentage = 100
            progress.completed_at = now
            if not progress.started_at:
                progress.started_at = now
            progress.save(update_fields=['is_completed', 'progress_percentage', 'completed_at', 'started_at'])

        return Response({
            'progress': LessonProgressSerializer(progress).data,
            'enrollment': _sync_enrollment_progress(request.user, course),
        })
