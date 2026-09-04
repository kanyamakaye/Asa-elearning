from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    due_date = serializers.DateTimeField(required=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'module', 'lesson', 'title', 'description', 'instructions',
            'maximum_marks', 'passing_marks', 'due_date', 'submission_type', 'allowed_file_types',
            'max_file_size', 'allow_late_submission', 'late_penalty', 'attachment', 'status',
            'submission_count', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Must be at least 3 characters long.')
        return value

    def validate_maximum_marks(self, value):
        if value <= 0:
            raise serializers.ValidationError('Must be greater than 0.')
        return value

    def validate(self, attrs):
        maximum = attrs.get('maximum_marks', getattr(self.instance, 'maximum_marks', None))
        passing = attrs.get('passing_marks', getattr(self.instance, 'passing_marks', None))
        if maximum is not None and passing is not None and passing > maximum:
            raise serializers.ValidationError({'passing_marks': 'Cannot exceed the maximum marks.'})
        return attrs


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

    def validate_marks_awarded(self, value):
        if value < 0:
            raise serializers.ValidationError('Cannot be negative.')
        return value
