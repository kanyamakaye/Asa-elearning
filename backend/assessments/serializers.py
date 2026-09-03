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


class QuizQuestionPublicSerializer(QuizQuestionSerializer):
    options = QuestionOptionPublicSerializer(many=True, read_only=True)

    class Meta(QuizQuestionSerializer.Meta):
        fields = ['id', 'quiz', 'question_text', 'question_type', 'marks', 'order', 'options']


class QuizSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'course', 'module', 'lesson', 'title', 'description', 'duration_minutes',
            'total_marks', 'passing_marks', 'attempt_limit', 'shuffle_questions', 'show_answers',
            'available_from', 'available_until', 'status', 'question_count', 'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


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
    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'course', 'assessment_type', 'assessment_id', 'marks_obtained',
            'maximum_marks', 'percentage', 'letter_grade', 'remarks', 'graded_by', 'graded_at',
        ]
        read_only_fields = ['id', 'percentage', 'letter_grade', 'graded_by', 'graded_at']
