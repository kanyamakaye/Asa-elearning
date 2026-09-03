from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import IsInstructorOrReadOnly

from .models import Exam, Grade, QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion
from .serializers import (
    ExamSerializer,
    GradeSerializer,
    QuizAttemptSerializer,
    QuizDetailSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
    SubmitAnswerSerializer,
)

AUTO_GRADABLE_TYPES = {QuizQuestion.QuestionType.MULTIPLE_CHOICE, QuizQuestion.QuestionType.TRUE_FALSE}


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    permission_classes = [IsInstructorOrReadOnly]

    def get_serializer_class(self):
        return QuizDetailSerializer if self.action == 'retrieve' else QuizSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start(self, request, pk=None):
        quiz = self.get_object()
        previous_attempts = QuizAttempt.objects.filter(quiz=quiz, student=request.user).count()
        if previous_attempts >= quiz.attempt_limit:
            raise ValidationError('You have reached the maximum number of attempts for this quiz.')
        attempt = QuizAttempt.objects.create(
            quiz=quiz, student=request.user, attempt_number=previous_attempts + 1
        )
        return Response(QuizAttemptSerializer(attempt).data, status=201)


class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.prefetch_related('options').all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        quiz_id = self.request.query_params.get('quiz')
        return qs.filter(quiz_id=quiz_id) if quiz_id else qs


class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = QuizAttempt.objects.select_related('quiz', 'student').prefetch_related('answers')
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            quiz_id = self.request.query_params.get('quiz')
            return qs.filter(quiz_id=quiz_id) if quiz_id else qs
        return qs.filter(student=user)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user:
            raise PermissionDenied('This is not your attempt.')
        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise ValidationError('This attempt has already been submitted.')

        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        answer, _ = QuizAnswer.objects.update_or_create(
            attempt=attempt,
            question=data['question'],
            defaults={
                'selected_option': data.get('selected_option'),
                'answer_text': data.get('answer_text', ''),
            },
        )
        # get_queryset() prefetches `answers`, which was cached onto `attempt`
        # before the update_or_create above — refetch so the response reflects it.
        attempt.refresh_from_db()
        return Response(QuizAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user:
            raise PermissionDenied('This is not your attempt.')
        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise ValidationError('This attempt has already been submitted.')

        needs_manual_grading = False
        total_score = 0
        for answer in attempt.answers.select_related('question', 'selected_option'):
            question = answer.question
            if question.question_type in AUTO_GRADABLE_TYPES:
                is_correct = bool(answer.selected_option and answer.selected_option.is_correct)
                answer.is_correct = is_correct
                answer.marks_awarded = question.marks if is_correct else 0
                answer.graded_at = timezone.now()
                answer.save(update_fields=['is_correct', 'marks_awarded', 'graded_at'])
                total_score += float(answer.marks_awarded)
            else:
                needs_manual_grading = True
                total_score += float(answer.marks_awarded)

        attempt.score = total_score
        attempt.percentage = round((total_score / attempt.quiz.total_marks) * 100, 2) if attempt.quiz.total_marks else 0
        attempt.passed = attempt.score >= attempt.quiz.passing_marks
        attempt.status = QuizAttempt.Status.SUBMITTED if needs_manual_grading else QuizAttempt.Status.GRADED
        attempt.submitted_at = timezone.now()
        attempt.save()
        # Same stale-prefetch issue as in answer() above — refresh before serializing.
        attempt.refresh_from_db()
        return Response(QuizAttemptSerializer(attempt).data)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        return qs.filter(course_id=course_id) if course_id else qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.select_related('student', 'course')
        if user.user_type in ('admin', 'instructor') or user.is_staff:
            course_id = self.request.query_params.get('course')
            student_id = self.request.query_params.get('student')
            if course_id:
                qs = qs.filter(course_id=course_id)
            if student_id:
                qs = qs.filter(student_id=student_id)
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(graded_by=self.request.user)
