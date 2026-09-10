from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Assignment, AssignmentSubmission, Rubric, RubricCriterion


class RubricCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricCriterion
        fields = ['id', 'title', 'description', 'max_points', 'order']


class RubricSerializer(serializers.ModelSerializer):
    criteria = RubricCriterionSerializer(many=True, required=False)

    class Meta:
        model = Rubric
        fields = ['id', 'title', 'description', 'criteria', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Not a model field — computed so the grading UI can show "X / total".
        data['total_points'] = sum(c.max_points for c in instance.criteria.all())
        return data

    def create(self, validated_data):
        criteria_data = validated_data.pop('criteria', [])
        rubric = Rubric.objects.create(**validated_data)
        for criterion_data in criteria_data:
            RubricCriterion.objects.create(rubric=rubric, **criterion_data)
        return rubric

    def update(self, instance, validated_data):
        criteria_data = validated_data.pop('criteria', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if criteria_data is not None:
            instance.criteria.all().delete()
            for criterion_data in criteria_data:
                RubricCriterion.objects.create(rubric=instance, **criterion_data)
        return instance


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    due_date = serializers.DateTimeField(required=True)
    rubric_detail = RubricSerializer(source='rubric', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'module', 'lesson', 'title', 'description', 'instructions',
            'maximum_marks', 'passing_marks', 'due_date', 'submission_type', 'allowed_file_types',
            'max_file_size', 'allow_late_submission', 'late_penalty', 'attachment', 'rubric', 'rubric_detail',
            'status', 'submission_count', 'created_by', 'created_at', 'updated_at',
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
            'marks_awarded', 'rubric_scores', 'feedback', 'graded_by', 'graded_at', 'status',
        ]
        read_only_fields = [
            'id', 'student', 'submitted_at', 'is_late', 'marks_awarded', 'rubric_scores', 'feedback',
            'graded_by', 'graded_at', 'status',
        ]


class GradeSubmissionSerializer(serializers.Serializer):
    marks_awarded = serializers.DecimalField(max_digits=6, decimal_places=2)
    feedback = serializers.CharField(required=False, allow_blank=True, default='')
    # {criterion_id: points_awarded}, only meaningful when the assignment has
    # a rubric attached — stored for the record, marks_awarded is still the
    # source of truth for the grade itself (the frontend sums it client-side).
    rubric_scores = serializers.DictField(required=False, default=dict)

    def validate_marks_awarded(self, value):
        if value < 0:
            raise serializers.ValidationError('Cannot be negative.')
        return value
