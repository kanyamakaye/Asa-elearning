from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import Quiz

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
