from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import IsInstructorOrReadOnly

from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer, GradeSubmissionSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        return qs.filter(course_id=course_id) if course_id else qs

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def grade(self, request, pk=None):
        submission = self.get_object()
        if request.user.user_type not in ('instructor', 'admin') and not request.user.is_staff:
            raise PermissionDenied('Only instructors can grade submissions.')
        serializer = GradeSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission.marks_awarded = serializer.validated_data['marks_awarded']
        submission.feedback = serializer.validated_data.get('feedback', '')
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.status = AssignmentSubmission.Status.GRADED
        submission.save()
        return Response(AssignmentSubmissionSerializer(submission).data)
