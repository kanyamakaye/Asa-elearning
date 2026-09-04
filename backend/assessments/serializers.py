from rest_framework import serializers

from .models import Exam, Grade, QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'is_correct', 'order']


class QuestionOptionPublicSerializer(serializers.ModelSerializer):
    """Hides ``is_correct`` from students while a quiz is in progress."""

    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'order']


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, required=False)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'question_text', 'question_type', 'marks', 'order', 'explanation', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = QuizQuestion.objects.create(**validated_data)
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if options_data is not None:
            # Full replace keeps the option-management UI simple: it always
            # PUTs the complete option list for a question rather than
            # diffing adds/edits/deletes itself.
            instance.options.all().delete()
            for option_data in options_data:
                QuestionOption.objects.create(question=instance, **option_data)
        return instance


class QuizQuestionPublicSerializer(QuizQuestionSerializer):
    options = QuestionOptionPublicSerializer(many=True, read_only=True)

    class Meta(QuizQuestionSerializer.Meta):
        fields = ['id', 'quiz', 'question_text', 'question_type', 'marks', 'order', 'options']


class QuizSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'course', 'module', 'lesson', 'title', 'description', 'instructions', 'duration_minutes',
            'total_marks', 'passing_marks', 'attempt_limit', 'shuffle_questions', 'show_answers',
            'available_from', 'available_until', 'status', 'question_count', 'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Must be at least 3 characters long.')
        return value

    def validate(self, attrs):
        total = attrs.get('total_marks', getattr(self.instance, 'total_marks', None))
        passing = attrs.get('passing_marks', getattr(self.instance, 'passing_marks', None))
        if total is not None and passing is not None and passing > total:
            raise serializers.ValidationError({'passing_marks': 'Cannot exceed the total marks.'})
        available_from = attrs.get('available_from', getattr(self.instance, 'available_from', None))
        available_until = attrs.get('available_until', getattr(self.instance, 'available_until', None))
        if available_from and available_until and available_until <= available_from:
            raise serializers.ValidationError({'available_until': 'Must be after the opening time.'})
        return attrs


class QuizDetailSerializer(QuizSerializer):
    questions = serializers.SerializerMethodField()

    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']

    def get_questions(self, obj):
        request = self.context.get('request')
        is_manager = request and request.user.is_authenticated and request.user.user_type in ('instructor', 'admin')
        serializer_class = QuizQuestionSerializer if is_manager else QuizQuestionPublicSerializer
        return serializer_class(obj.questions.all(), many=True).data


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = [
            'id', 'attempt', 'question', 'selected_option', 'answer_text', 'marks_awarded',
            'is_correct', 'graded_by', 'graded_at',
        ]
        read_only_fields = ['id', 'marks_awarded', 'is_correct', 'graded_by', 'graded_at']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'student', 'attempt_number', 'started_at', 'submitted_at', 'score',
            'percentage', 'passed', 'status', 'answers',
        ]
        read_only_fields = [
            'id', 'student', 'attempt_number', 'started_at', 'submitted_at', 'score',
            'percentage', 'passed', 'status',
        ]


class SubmitAnswerSerializer(serializers.Serializer):
    question = serializers.PrimaryKeyRelatedField(queryset=QuizQuestion.objects.all())
    selected_option = serializers.PrimaryKeyRelatedField(
        queryset=QuestionOption.objects.all(), required=False, allow_null=True
    )
    answer_text = serializers.CharField(required=False, allow_blank=True, default='')


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'title', 'description', 'exam_date', 'start_time', 'end_time',
            'duration_minutes', 'total_marks', 'passing_marks', 'attempt_limit', 'status',
            'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class GradeSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'course', 'course_title', 'assessment_type', 'assessment_id',
            'marks_obtained', 'maximum_marks', 'percentage', 'letter_grade', 'remarks',
            'graded_by', 'graded_at',
        ]
        read_only_fields = ['id', 'percentage', 'letter_grade', 'graded_by', 'graded_at']
