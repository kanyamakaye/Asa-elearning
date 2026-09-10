from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import CanManageAssessment
from common.responses import StandardResponseMixin, success_response
from notifications.services import notify_enrolled_students

from .models import Assignment, AssignmentSubmission, Rubric
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer, GradeSubmissionSerializer, RubricSerializer


class AssignmentViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('course', 'created_by').all()
    serializer_class = AssignmentSerializer
    permission_classes = [CanManageAssessment]
    create_message = 'Assignment created successfully.'
    update_message = 'Assignment updated successfully.'
    delete_message = 'Assignment deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        return qs.filter(course_id=course_id) if course_id else qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = Assignment.Status.PUBLISHED
        assignment.save(update_fields=['status'])
        notify_enrolled_students(
            assignment.course,
            notification_type='assignment_published',
            title='New Assignment Posted',
            message=f'A new assignment "{assignment.title}" has been posted in {assignment.course.title}.',
            reference_type='assignment',
            reference_id=assignment.id,
        )
        return success_response(AssignmentSerializer(assignment).data, 'Assignment published successfully.')

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        assignment = self.get_object()
        qs = assignment.submissions.select_related('student')
        if request.user.user_type not in ('admin', 'instructor', 'academic_manager') and not request.user.is_staff:
            qs = qs.filter(student=request.user)
        return Response(AssignmentSubmissionSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        is_late = bool(assignment.due_date and timezone.now() > assignment.due_date)
        if is_late and not assignment.allow_late_submission:
            raise ValidationError('The due date for this assignment has passed.')
        data = {**request.data, 'assignment': assignment.id}
        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment, student=request.user,
            defaults={
                'submission_text': data.get('submission_text', ''),
                'file': request.FILES.get('file'),
                'is_late': is_late,
                'status': AssignmentSubmission.Status.LATE if is_late else AssignmentSubmission.Status.SUBMITTED,
            },
        )
        if not created:
            submission.submission_text = data.get('submission_text', submission.submission_text)
            if request.FILES.get('file'):
                submission.file = request.FILES.get('file')
            submission.is_late = is_late
            submission.status = AssignmentSubmission.Status.LATE if is_late else AssignmentSubmission.Status.SUBMITTED
            submission.save()
        return success_response(AssignmentSubmissionSerializer(submission).data, 'Assignment submitted successfully.', 201)


class RubricViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Rubric.objects.prefetch_related('criteria').all()
    serializer_class = RubricSerializer
    permission_classes = [CanManageAssessment]
    create_message = 'Rubric created successfully.'
    update_message = 'Rubric updated successfully.'
    delete_message = 'Rubric deleted successfully.'

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AssignmentSubmission.objects.select_related('student', 'assignment')
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        assignment = serializer.validated_data['assignment']
        is_late = bool(assignment.due_date and timezone.now() > assignment.due_date)
        if is_late and not assignment.allow_late_submission:
            raise ValidationError('The due date for this assignment has passed.')
        serializer.save(student=self.request.user, is_late=is_late)

    @action(detail=True, methods=['post', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def grade(self, request, pk=None):
        submission = self.get_object()
        if request.user.user_type not in ('instructor', 'admin', 'academic_manager') and not request.user.is_staff:
            raise PermissionDenied('Only instructors can grade submissions.')
        if submission.assignment.created_by_id != request.user.id and not (
            request.user.is_staff or request.user.user_type in ('admin', 'academic_manager')
        ) and submission.assignment.course.instructor_id != request.user.id:
            raise PermissionDenied('You can only grade submissions for your own assignments.')
        serializer = GradeSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        max_marks = submission.assignment.maximum_marks
        if serializer.validated_data['marks_awarded'] > max_marks:
            raise ValidationError({'marks_awarded': [f'Cannot exceed the assignment maximum of {max_marks}.']})

        submission.marks_awarded = serializer.validated_data['marks_awarded']
        submission.feedback = serializer.validated_data.get('feedback', '')
        submission.rubric_scores = serializer.validated_data.get('rubric_scores', {})
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.status = AssignmentSubmission.Status.GRADED
        submission.save()
        return success_response(AssignmentSubmissionSerializer(submission).data, 'Submission graded successfully.')
