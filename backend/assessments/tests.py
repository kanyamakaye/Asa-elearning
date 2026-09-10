from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory
from enrollments.models import Enrollment

from .models import BankQuestion, Exam, QuestionBank, Quiz, QuizAttempt, QuizQuestion

User = get_user_model()


class QuizCreationTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Data Science')
        self.instructor = User.objects.create_user(
            username='qinstructor', email='qinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='qstudent', email='qstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Intro to Data Science', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.payload = {
            'course': self.course.id,
            'title': 'Chapter 1 Quiz',
            'description': 'Basics check.',
            'instructions': 'Answer all questions.',
            'duration_minutes': 20,
            'total_marks': 10,
            'passing_marks': 5,
            'attempt_limit': 2,
            'shuffle_questions': False,
            'show_answers': True,
        }

    def test_instructor_can_create_quiz(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/quizzes/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['success'])

    def test_student_cannot_create_quiz(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/quizzes/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_quiz_requires_course(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload}
        del payload['course']
        response = self.client.post('/api/v1/quizzes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_passing_score_rejected(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'passing_marks': 99}
        response = self.client.post('/api/v1/quizzes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('passing_marks', response.data['errors'])

    def test_quiz_requires_at_least_one_question_before_publish(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/quizzes/', self.payload, format='json')
        quiz_id = create_resp.data['data']['id']
        response = self.client.post(f'/api/v1/quizzes/{quiz_id}/publish/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quiz_publishes_after_adding_a_question(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/quizzes/', self.payload, format='json')
        quiz_id = create_resp.data['data']['id']
        self.client.post(
            f'/api/v1/quizzes/{quiz_id}/questions/',
            {
                'question_text': 'What is 2 + 2?',
                'question_type': 'multiple_choice',
                'marks': 5,
                'options': [
                    {'option_text': '3', 'is_correct': False},
                    {'option_text': '4', 'is_correct': True},
                ],
            },
            format='json',
        )
        response = self.client.post(f'/api/v1/quizzes/{quiz_id}/publish/')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(Quiz.objects.get(id=quiz_id).status, 'published')


class QuestionBankTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Software Development')
        self.instructor = User.objects.create_user(
            username='binstructor', email='binstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.other_instructor = User.objects.create_user(
            username='binstructor2', email='binstructor2@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='bstudent', email='bstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Python Basics', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.bank = QuestionBank.objects.create(
            title='Python Fundamentals', category=self.category, course=self.course, created_by=self.instructor,
        )

    def test_instructor_can_create_bank(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            '/api/v1/question-banks/', {'title': 'Loops & Conditionals', 'category': self.category.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['data']['created_by'], self.instructor.id)

    def test_student_cannot_create_bank(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/question-banks/', {'title': 'Nope'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_list_banks(self):
        self.client.force_authenticate(self.student)
        response = self.client.get('/api/v1/question-banks/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_bank_question_with_options(self):
        self.client.force_authenticate(self.instructor)
        payload = {
            'bank': self.bank.id,
            'question_text': 'What does len([1,2,3]) return?',
            'question_type': 'numerical',
            'marks': 2,
            'difficulty': 'easy',
            'tags': ['python', 'basics'],
            'config': {'correct_answer': 3, 'tolerance': 0},
        }
        response = self.client.post('/api/v1/question-banks/questions/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['data']['config']['correct_answer'], 3)

    def test_add_questions_from_bank_copies_into_quiz(self):
        bank_question = BankQuestion.objects.create(
            bank=self.bank, question_text='2 + 2 = ?', question_type='multiple_choice', marks=3,
        )
        bank_question.options.create(option_text='3', is_correct=False, order=0)
        bank_question.options.create(option_text='4', is_correct=True, order=1)

        quiz = Quiz.objects.create(course=self.course, title='Warmup Quiz', created_by=self.instructor)
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f'/api/v1/quizzes/{quiz.id}/add-from-bank/', {'bank_question_ids': [bank_question.id]}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        quiz_question = QuizQuestion.objects.get(quiz=quiz)
        self.assertEqual(quiz_question.question_text, '2 + 2 = ?')
        self.assertEqual(quiz_question.marks, 3)
        self.assertEqual(quiz_question.options.count(), 2)
        self.assertTrue(quiz_question.options.get(option_text='4').is_correct)
        # The copy is independent — editing the bank question afterwards
        # must not retroactively change the quiz.
        bank_question.question_text = 'Changed'
        bank_question.save()
        quiz_question.refresh_from_db()
        self.assertEqual(quiz_question.question_text, '2 + 2 = ?')

    def test_cannot_add_from_bank_to_a_quiz_you_do_not_own(self):
        other_course = Course.objects.create(
            title='Other Course', category=self.category, instructor=self.other_instructor,
            status=Course.Status.PUBLISHED,
        )
        quiz = Quiz.objects.create(course=other_course, title='Not Yours', created_by=self.other_instructor)
        bank_question = BankQuestion.objects.create(bank=self.bank, question_text='Q', question_type='essay')

        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f'/api/v1/quizzes/{quiz.id}/add-from-bank/', {'bank_question_ids': [bank_question.id]}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ExamTakingTests(APITestCase):
    """Exam previously had no way to actually be sat — this covers the new
    question/attempt mirror of Quiz."""

    def setUp(self):
        self.category = CourseCategory.objects.create(name='Engineering')
        self.instructor = User.objects.create_user(
            username='einstructor', email='einstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='estudent', email='estudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Structural Engineering', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        self.exam = Exam.objects.create(
            course=self.course, title='Midterm', total_marks=10, passing_marks=5, created_by=self.instructor,
        )

    def test_exam_cannot_be_activated_without_questions(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post(f'/api/v1/exams/{self.exam.id}/activate/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_see_or_start_a_scheduled_exam(self):
        self.client.force_authenticate(self.instructor)
        self.client.post(
            f'/api/v1/exams/{self.exam.id}/questions/',
            {'question_text': 'What is 5+5?', 'question_type': 'multiple_choice', 'marks': 10, 'options': [
                {'option_text': '9', 'is_correct': False}, {'option_text': '10', 'is_correct': True},
            ]},
            format='json',
        )
        self.client.force_authenticate(self.student)
        # A non-active exam is filtered out of the student's queryset entirely
        # (same as an unpublished Quiz) — get_object() 404s before start()'s
        # own status check would even run.
        response = self.client.post(f'/api/v1/exams/{self.exam.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_full_exam_taking_and_auto_grading_flow(self):
        self.client.force_authenticate(self.instructor)
        add_q = self.client.post(
            f'/api/v1/exams/{self.exam.id}/questions/',
            {'question_text': 'What is 5+5?', 'question_type': 'multiple_choice', 'marks': 10, 'options': [
                {'option_text': '9', 'is_correct': False}, {'option_text': '10', 'is_correct': True},
            ]},
            format='json',
        )
        self.assertEqual(add_q.status_code, status.HTTP_201_CREATED, add_q.data)
        correct_option_id = next(o['id'] for o in add_q.data['data']['options'] if o['option_text'] == '10')

        activate = self.client.post(f'/api/v1/exams/{self.exam.id}/activate/')
        self.assertEqual(activate.status_code, status.HTTP_200_OK, activate.data)

        self.client.force_authenticate(self.student)
        start = self.client.post(f'/api/v1/exams/{self.exam.id}/start/')
        self.assertEqual(start.status_code, status.HTTP_201_CREATED, start.data)
        attempt_id = start.data['id']

        answer = self.client.post(
            f'/api/v1/exams/attempts/{attempt_id}/answer/',
            {'question': add_q.data['data']['id'], 'selected_option': correct_option_id},
            format='json',
        )
        self.assertEqual(answer.status_code, status.HTTP_200_OK, answer.data)

        submit = self.client.post(f'/api/v1/exams/attempts/{attempt_id}/submit/')
        self.assertEqual(submit.status_code, status.HTTP_200_OK, submit.data)
        self.assertEqual(submit.data['status'], 'graded')
        self.assertEqual(float(submit.data['score']), 10.0)
        self.assertTrue(submit.data['passed'])

    def test_attempt_limit_enforced(self):
        self.exam.attempt_limit = 1
        self.exam.status = Exam.Status.ACTIVE
        self.exam.save()
        self.client.force_authenticate(self.instructor)
        self.client.post(
            f'/api/v1/exams/{self.exam.id}/questions/',
            {'question_text': 'Q', 'question_type': 'essay', 'marks': 10}, format='json',
        )
        self.client.force_authenticate(self.student)
        self.client.post(f'/api/v1/exams/{self.exam.id}/start/')
        response = self.client.post(f'/api/v1/exams/{self.exam.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ManualGradingTests(APITestCase):
    """Quiz essay/short-answer manual grading — the actual gap the audit
    found (assignment grading already existed)."""

    def setUp(self):
        self.category = CourseCategory.objects.create(name='Literature')
        self.instructor = User.objects.create_user(
            username='ginstructor', email='ginstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.other_instructor = User.objects.create_user(
            username='ginstructor2', email='ginstructor2@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='gstudent', email='gstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Poetry Analysis', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        self.quiz = Quiz.objects.create(
            course=self.course, title='Reflection Quiz', total_marks=10, passing_marks=5,
            status=Quiz.Status.PUBLISHED, created_by=self.instructor,
        )
        self.question = QuizQuestion.objects.create(
            quiz=self.quiz, question_text='Reflect on the poem.', question_type='essay', marks=10,
        )

    def _submit_essay_attempt(self):
        self.client.force_authenticate(self.student)
        start = self.client.post(f'/api/v1/quizzes/{self.quiz.id}/start/')
        attempt_id = start.data['id']
        self.client.post(
            f'/api/v1/quizzes/attempts/{attempt_id}/answer/',
            {'question': self.question.id, 'answer_text': 'A thoughtful reflection.'}, format='json',
        )
        submit = self.client.post(f'/api/v1/quizzes/attempts/{attempt_id}/submit/')
        self.assertEqual(submit.data['status'], 'submitted')  # awaiting manual grading
        return attempt_id, submit.data['answers'][0]['id']

    def test_essay_attempt_stays_submitted_until_graded(self):
        self._submit_essay_attempt()

    def test_instructor_can_grade_essay_answer(self):
        attempt_id, answer_id = self._submit_essay_attempt()
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f'/api/v1/quizzes/attempts/{attempt_id}/grade-answer/',
            {'answer_id': answer_id, 'marks_awarded': 8, 'feedback': 'Good insight, could go deeper.'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['status'], 'graded')
        self.assertEqual(float(response.data['data']['score']), 8.0)
        self.assertEqual(response.data['data']['answers'][0]['feedback'], 'Good insight, could go deeper.')

    def test_marks_awarded_cannot_exceed_question_marks(self):
        attempt_id, answer_id = self._submit_essay_attempt()
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f'/api/v1/quizzes/attempts/{attempt_id}/grade-answer/',
            {'answer_id': answer_id, 'marks_awarded': 999}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_instructor_cannot_grade(self):
        attempt_id, answer_id = self._submit_essay_attempt()
        self.client.force_authenticate(self.other_instructor)
        response = self.client.post(
            f'/api/v1/quizzes/attempts/{attempt_id}/grade-answer/',
            {'answer_id': answer_id, 'marks_awarded': 5}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_grade_own_answer(self):
        attempt_id, answer_id = self._submit_essay_attempt()
        self.client.force_authenticate(self.student)
        response = self.client.post(
            f'/api/v1/quizzes/attempts/{attempt_id}/grade-answer/',
            {'answer_id': answer_id, 'marks_awarded': 10}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class QuizRandomizationTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='History')
        self.instructor = User.objects.create_user(
            username='rinstructor', email='rinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='rstudent', email='rstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='World History', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.quiz = Quiz.objects.create(
            course=self.course, title='Shuffled Quiz', shuffle_questions=True,
            status=Quiz.Status.PUBLISHED, created_by=self.instructor,
        )
        for i in range(8):
            QuizQuestion.objects.create(quiz=self.quiz, question_text=f'Q{i}', order=i)

    def test_student_sees_a_consistent_but_shuffled_order(self):
        self.client.force_authenticate(self.student)
        first = self.client.get(f'/api/v1/quizzes/{self.quiz.id}/')
        second = self.client.get(f'/api/v1/quizzes/{self.quiz.id}/')
        order_first = [q['id'] for q in first.data['questions']]
        order_second = [q['id'] for q in second.data['questions']]
        natural_order = list(QuizQuestion.objects.filter(quiz=self.quiz).order_by('order', 'id').values_list('id', flat=True))

        self.assertEqual(order_first, order_second, 'Same student must see the same order on reload.')
        self.assertNotEqual(order_first, natural_order, 'shuffle_questions=True must actually reorder.')
        self.assertEqual(sorted(order_first), sorted(natural_order))

    def test_instructor_always_sees_natural_order(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.get(f'/api/v1/quizzes/{self.quiz.id}/')
        order = [q['id'] for q in response.data['questions']]
        natural_order = list(QuizQuestion.objects.filter(quiz=self.quiz).order_by('order', 'id').values_list('id', flat=True))
        self.assertEqual(order, natural_order)
