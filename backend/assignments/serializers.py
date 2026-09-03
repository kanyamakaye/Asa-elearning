from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'module', 'title', 'description', 'maximum_marks', 'passing_marks',
            'due_date', 'allow_late_submission', 'attachment', 'status', 'submission_count',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student = UserPublicSerializer(read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'student', 'submission_text', 'file', 'submitted_at', 'is_late',
            'marks_awarded', 'feedback', 'graded_by', 'graded_at', 'status',
        ]
        read_only_fields = [
            'id', 'student', 'submitted_at', 'is_late', 'marks_awarded', 'feedback',
            'graded_by', 'graded_at', 'status',
        ]


class GradeSubmissionSerializer(serializers.Serializer):
    marks_awarded = serializers.DecimalField(max_digits=6, decimal_places=2)
    feedback = serializers.CharField(required=False, allow_blank=True, default='')
