from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import BankQuestion, QuestionBank, Quiz, QuizQuestion

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
