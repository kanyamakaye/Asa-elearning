from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import CanManageAssessment
from common.responses import StandardResponseMixin, success_response
from notifications.services import notify_enrolled_students
from progress import badges

from .models import (
    BankQuestion,
    Exam,
    ExamAnswer,
    ExamAttempt,
    ExamQuestion,
    Grade,
    QuestionBank,
    QuestionOption,
    Quiz,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
)
from .serializers import (
    AddFromBankSerializer,
    BankQuestionSerializer,
    ExamAttemptSerializer,
    ExamDetailSerializer,
    ExamQuestionSerializer,
    ExamSerializer,
    GradeAnswerSerializer,
    GradeSerializer,
    QuestionBankDetailSerializer,
    QuestionBankSerializer,
    QuizAttemptSerializer,
    QuizDetailSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
    SubmitAnswerSerializer,
    SubmitExamAnswerSerializer,
)

AUTO_GRADABLE_TYPES = {QuizQuestion.QuestionType.MULTIPLE_CHOICE, QuizQuestion.QuestionType.TRUE_FALSE}


class IsAssessmentManager(CanManageAssessment):
    """Like CanManageAssessment but without the SAFE_METHODS-open-to-anyone
    rule — question banks always expose ``is_correct``/``config`` (there is
    no public/hidden variant like QuizQuestionPublicSerializer), so even
    reads must stay instructor/admin-only."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.user_type in self.WRITE_ROLES))


class QuizViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Quiz.objects.select_related('course', 'created_by').all()
    permission_classes = [CanManageAssessment]
    create_message = 'Quiz created successfully.'
    update_message = 'Quiz updated successfully.'
    delete_message = 'Quiz deleted successfully.'

    def get_serializer_class(self):
        return QuizDetailSerializer if self.action == 'retrieve' else QuizSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        module_id = self.request.query_params.get('module')
        if module_id:
            qs = qs.filter(module_id=module_id)
        user = self.request.user
        is_manager = user.is_authenticated and (
            user.is_staff or user.user_type in ('admin', 'academic_manager', 'instructor')
        )
        # Students (and anonymous requests, which SAFE_METHODS otherwise
        # allow through CanManageAssessment) only ever see published quizzes.
        if not is_manager:
            qs = qs.filter(status=Quiz.Status.PUBLISHED)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='questions')
    def questions(self, request, pk=None):
        quiz = self.get_object()
        if request.method == 'GET':
            return Response(QuizQuestionSerializer(quiz.questions.all(), many=True).data)
        self.check_object_permissions(request, quiz)
        serializer = QuizQuestionSerializer(data={**request.data, 'quiz': quiz.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(quiz=quiz)
        return success_response(serializer.data, 'Question added successfully.', 201)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        if not quiz.questions.exists():
            raise ValidationError('A quiz must have at least one question before it can be published.')
        quiz.status = Quiz.Status.PUBLISHED
        quiz.save(update_fields=['status'])
        notify_enrolled_students(
            quiz.course,
            notification_type='quiz_published',
            title='New Quiz Available',
            message=f'A new quiz "{quiz.title}" is available in {quiz.course.title}.',
            reference_type='quiz',
            reference_id=quiz.id,
        )
        return success_response(QuizDetailSerializer(quiz, context=self.get_serializer_context()).data, 'Quiz published successfully.')

    @action(detail=True, methods=['post'], url_path='add-from-bank')
    def add_from_bank(self, request, pk=None):
        """Copies bank questions (+ their options) into this quiz. Questions
        stay independent of the quiz in the bank (question.md #13/#20) — this
        creates new QuizQuestion rows rather than referencing the bank ones,
        so later edits to the bank question don't retroactively change a
        quiz a student may have already attempted."""
        quiz = self.get_object()
        self.check_object_permissions(request, quiz)
        serializer = AddFromBankSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bank_questions = serializer.validated_data['bank_question_ids']

        next_order = quiz.questions.count()
        created = []
        for offset, bank_question in enumerate(bank_questions):
            question = QuizQuestion.objects.create(
                quiz=quiz,
                question_text=bank_question.question_text,
                question_type=bank_question.question_type,
                marks=bank_question.marks,
                order=next_order + offset,
                explanation=bank_question.explanation,
                config=bank_question.config,
            )
            for option in bank_question.options.all():
                QuestionOption.objects.create(
                    question=question, option_text=option.option_text,
                    is_correct=option.is_correct, order=option.order,
                )
            created.append(question)
        return success_response(
            QuizQuestionSerializer(created, many=True).data, f'{len(created)} question(s) added from the bank.', 201
        )

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
    queryset = QuizQuestion.objects.select_related('quiz', 'quiz__course').prefetch_related('options').all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [CanManageAssessment]

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
        if not (user.user_type in ('admin', 'instructor') or user.is_staff):
            qs = qs.filter(student=user)
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        status_param = self.request.query_params.get('status')
        return qs.filter(status=status_param) if status_param else qs

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
        if not needs_manual_grading:
            badges.check_quiz_score_badge(attempt.student, attempt.quiz.course, attempt.percentage)
        # Same stale-prefetch issue as in answer() above — refresh before serializing.
        attempt.refresh_from_db()
        return Response(QuizAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'], url_path='grade-answer', permission_classes=[CanManageAssessment])
    def grade_answer(self, request, pk=None):
        """Manual grading for one essay/short-answer QuizAnswer — the
        counterpart to AssignmentSubmissionViewSet.grade(). Recomputes the
        attempt's score/percentage/passed, and flips it to GRADED once every
        answer that needed manual grading has been graded."""
        attempt = self.get_object()
        self.check_object_permissions(request, attempt.quiz)
        if attempt.status == QuizAttempt.Status.IN_PROGRESS:
            raise ValidationError('This attempt has not been submitted yet.')

        serializer = GradeAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        answer = attempt.answers.filter(id=data['answer_id']).select_related('question').first()
        if not answer:
            raise ValidationError({'answer_id': 'Not found on this attempt.'})
        if data['marks_awarded'] > answer.question.marks:
            raise ValidationError({'marks_awarded': [f"Cannot exceed the question's {answer.question.marks} marks."]})

        answer.marks_awarded = data['marks_awarded']
        answer.is_correct = data['marks_awarded'] >= answer.question.marks
        answer.feedback = data.get('feedback', '')
        answer.graded_by = request.user
        answer.graded_at = timezone.now()
        answer.save(update_fields=['marks_awarded', 'is_correct', 'feedback', 'graded_by', 'graded_at'])

        # attempt.answers was prefetched by get_object() before this answer
        # was graded — querying the model directly (instead of the cached
        # `attempt.answers` related manager) guarantees fresh marks_awarded.
        fresh_answers = QuizAnswer.objects.filter(attempt=attempt).select_related('question')
        total_score = sum(float(a.marks_awarded) for a in fresh_answers)
        fully_graded = not fresh_answers.filter(
            question__question_type__in=[QuizQuestion.QuestionType.ESSAY, QuizQuestion.QuestionType.SHORT_ANSWER],
            graded_at__isnull=True,
        ).exists()
        attempt.score = total_score
        attempt.percentage = round((total_score / attempt.quiz.total_marks) * 100, 2) if attempt.quiz.total_marks else 0
        attempt.passed = attempt.score >= attempt.quiz.passing_marks
        if fully_graded:
            attempt.status = QuizAttempt.Status.GRADED
        attempt.save(update_fields=['score', 'percentage', 'passed', 'status'])
        attempt.refresh_from_db()
        return success_response(QuizAttemptSerializer(attempt).data, 'Answer graded successfully.')


class ExamViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Exam.objects.select_related('course', 'created_by').all()
    permission_classes = [CanManageAssessment]
    create_message = 'Exam created successfully.'
    update_message = 'Exam updated successfully.'
    delete_message = 'Exam deleted successfully.'

    def get_serializer_class(self):
        return ExamDetailSerializer if self.action == 'retrieve' else ExamSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        user = self.request.user
        is_manager = user.is_authenticated and (
            user.is_staff or user.user_type in ('admin', 'academic_manager', 'instructor')
        )
        if not is_manager:
            qs = qs.filter(status=Exam.Status.ACTIVE)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='questions')
    def questions(self, request, pk=None):
        exam = self.get_object()
        if request.method == 'GET':
            return Response(ExamQuestionSerializer(exam.questions.all(), many=True).data)
        self.check_object_permissions(request, exam)
        serializer = ExamQuestionSerializer(data={**request.data, 'exam': exam.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(exam=exam)
        return success_response(serializer.data, 'Question added successfully.', 201)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Scheduled -> Active — the point at which students may start
        sitting the exam (Exam has no "draft/published" wording like Quiz,
        so this mirrors Quiz.publish() under Exam's own status vocabulary)."""
        exam = self.get_object()
        if not exam.questions.exists():
            raise ValidationError('An exam must have at least one question before it can be activated.')
        exam.status = Exam.Status.ACTIVE
        exam.save(update_fields=['status'])
        notify_enrolled_students(
            exam.course,
            notification_type='exam_scheduled',
            title='Exam Now Open',
            message=f'The exam "{exam.title}" is now open in {exam.course.title}.',
            reference_type='exam',
            reference_id=exam.id,
        )
        return success_response(ExamDetailSerializer(exam, context=self.get_serializer_context()).data, 'Exam activated successfully.')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start(self, request, pk=None):
        exam = self.get_object()
        if exam.status != Exam.Status.ACTIVE:
            raise ValidationError('This exam is not currently open.')
        previous_attempts = ExamAttempt.objects.filter(exam=exam, student=request.user).count()
        if previous_attempts >= exam.attempt_limit:
            raise ValidationError('You have reached the maximum number of attempts for this exam.')
        attempt = ExamAttempt.objects.create(
            exam=exam, student=request.user, attempt_number=previous_attempts + 1
        )
        return Response(ExamAttemptSerializer(attempt).data, status=201)


class ExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.select_related('exam', 'exam__course').prefetch_related('options').all()
    serializer_class = ExamQuestionSerializer
    permission_classes = [CanManageAssessment]

    def get_queryset(self):
        qs = super().get_queryset()
        exam_id = self.request.query_params.get('exam')
        return qs.filter(exam_id=exam_id) if exam_id else qs


class ExamAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ExamAttempt.objects.select_related('exam', 'student').prefetch_related('answers')
        if not (user.user_type in ('admin', 'instructor') or user.is_staff):
            qs = qs.filter(student=user)
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        status_param = self.request.query_params.get('status')
        return qs.filter(status=status_param) if status_param else qs

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user:
            raise PermissionDenied('This is not your attempt.')
        if attempt.status != ExamAttempt.Status.IN_PROGRESS:
            raise ValidationError('This attempt has already been submitted.')

        serializer = SubmitExamAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        answer, _ = ExamAnswer.objects.update_or_create(
            attempt=attempt,
            question=data['question'],
            defaults={
                'selected_option': data.get('selected_option'),
                'answer_text': data.get('answer_text', ''),
            },
        )
        attempt.refresh_from_db()
        return Response(ExamAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user:
            raise PermissionDenied('This is not your attempt.')
        if attempt.status != ExamAttempt.Status.IN_PROGRESS:
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
        attempt.percentage = round((total_score / attempt.exam.total_marks) * 100, 2) if attempt.exam.total_marks else 0
        attempt.passed = attempt.score >= attempt.exam.passing_marks
        attempt.status = ExamAttempt.Status.SUBMITTED if needs_manual_grading else ExamAttempt.Status.GRADED
        attempt.submitted_at = timezone.now()
        attempt.save()
        if not needs_manual_grading:
            badges.check_quiz_score_badge(attempt.student, attempt.exam.course, attempt.percentage)
        attempt.refresh_from_db()
        return Response(ExamAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'], url_path='grade-answer', permission_classes=[CanManageAssessment])
    def grade_answer(self, request, pk=None):
        attempt = self.get_object()
        self.check_object_permissions(request, attempt.exam)
        if attempt.status == ExamAttempt.Status.IN_PROGRESS:
            raise ValidationError('This attempt has not been submitted yet.')

        serializer = GradeAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        answer = attempt.answers.filter(id=data['answer_id']).select_related('question').first()
        if not answer:
            raise ValidationError({'answer_id': 'Not found on this attempt.'})
        if data['marks_awarded'] > answer.question.marks:
            raise ValidationError({'marks_awarded': [f"Cannot exceed the question's {answer.question.marks} marks."]})

        answer.marks_awarded = data['marks_awarded']
        answer.is_correct = data['marks_awarded'] >= answer.question.marks
        answer.feedback = data.get('feedback', '')
        answer.graded_by = request.user
        answer.graded_at = timezone.now()
        answer.save(update_fields=['marks_awarded', 'is_correct', 'feedback', 'graded_by', 'graded_at'])

        fresh_answers = ExamAnswer.objects.filter(attempt=attempt).select_related('question')
        total_score = sum(float(a.marks_awarded) for a in fresh_answers)
        fully_graded = not fresh_answers.filter(
            question__question_type__in=[QuizQuestion.QuestionType.ESSAY, QuizQuestion.QuestionType.SHORT_ANSWER],
            graded_at__isnull=True,
        ).exists()
        attempt.score = total_score
        attempt.percentage = round((total_score / attempt.exam.total_marks) * 100, 2) if attempt.exam.total_marks else 0
        attempt.passed = attempt.score >= attempt.exam.passing_marks
        if fully_graded:
            attempt.status = ExamAttempt.Status.GRADED
        attempt.save(update_fields=['score', 'percentage', 'passed', 'status'])
        attempt.refresh_from_db()
        return success_response(ExamAttemptSerializer(attempt).data, 'Answer graded successfully.')


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


class QuestionBankViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """Reusable question pools, independent of any one quiz (question.md
    #13). Read access is restricted to instructors/admins/staff — unlike
    quizzes, a bank has no "published" concept for students to see."""

    queryset = QuestionBank.objects.select_related('category', 'course', 'created_by').all()
    permission_classes = [IsAssessmentManager]
    create_message = 'Question bank created successfully.'
    update_message = 'Question bank updated successfully.'
    delete_message = 'Question bank deleted successfully.'

    def get_serializer_class(self):
        return QuestionBankDetailSerializer if self.action == 'retrieve' else QuestionBankSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BankQuestionViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = BankQuestion.objects.select_related('bank').prefetch_related('options').all()
    serializer_class = BankQuestionSerializer
    permission_classes = [IsAssessmentManager]
    create_message = 'Question added to the bank.'
    update_message = 'Bank question updated successfully.'
    delete_message = 'Bank question deleted successfully.'

    def get_queryset(self):
        qs = super().get_queryset()
        bank_id = self.request.query_params.get('bank')
        return qs.filter(bank_id=bank_id) if bank_id else qs
