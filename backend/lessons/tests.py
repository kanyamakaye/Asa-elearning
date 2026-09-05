from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory, CourseModule, CourseUnit

from .models import Lesson

User = get_user_model()


class LessonManagementTests(APITestCase):
    def setUp(self):
        category = CourseCategory.objects.create(name='Design 2')
        self.instructor = User.objects.create_user(
            username='lninstructor', email='lninstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.other_instructor = User.objects.create_user(
            username='lnother', email='lnother@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='lnstudent', email='lnstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.content_manager = User.objects.create_user(
            username='lncontent', email='lncontent@test.com', password='Pass1234!', user_type='content_manager'
        )
        self.course = Course.objects.create(title='UI Design', category=category, instructor=self.instructor)
        self.unit = CourseUnit.objects.create(course=self.course, title='Lesson 1', order=1)
        self.module = CourseModule.objects.create(unit=self.unit, title='Getting Started', order=1)
        self.payload = {
            'module': self.module.id,
            'title': 'Welcome Lesson',
            'description': 'Intro lesson.',
            'lesson_type': 'text',
            'content': 'Welcome to the course!',
            'duration_minutes': 10,
        }

    def test_instructor_can_create_lesson_in_own_course(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/lessons/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['success'])

    def test_other_instructor_cannot_create_lesson_in_foreign_course(self):
        self.client.force_authenticate(self.other_instructor)
        response = self.client.post('/api/v1/lessons/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_create_lesson(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/lessons/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_video_lesson_requires_video_url(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'lesson_type': 'video', 'video_url': ''}
        response = self.client.post('/api/v1/lessons/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('video_url', response.data['errors'])

    def test_content_manager_can_create_lesson_on_any_course(self):
        self.client.force_authenticate(self.content_manager)
        response = self.client.post('/api/v1/lessons/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_other_instructor_cannot_edit_lesson(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/lessons/', self.payload, format='json')
        lesson_id = create_resp.data['data']['id']

        self.client.force_authenticate(self.other_instructor)
        response = self.client.patch(f'/api/v1/lessons/{lesson_id}/', {'title': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
