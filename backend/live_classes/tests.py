from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import LiveSession

User = get_user_model()


class LiveClassSchedulingTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Design')
        self.instructor = User.objects.create_user(
            username='linstructor', email='linstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='lstudent', email='lstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='UX Fundamentals', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        tomorrow = (timezone.now() + timezone.timedelta(days=1)).date()
        self.payload = {
            'course': self.course.id,
            'title': 'Live Q&A Session',
            'description': 'Weekly review session.',
            'meeting_platform': 'zoom',
            'meeting_url': 'https://zoom.us/j/123456789',
            'scheduled_date': str(tomorrow),
            'start_time': '10:00:00',
            'end_time': '11:00:00',
            'timezone': 'UTC',
            'capacity': 50,
        }

    def test_instructor_can_schedule_class(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/live-classes/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['success'])
        session = LiveSession.objects.get(id=response.data['data']['id'])
        self.assertEqual(session.instructor_id, self.instructor.id)

    def test_student_cannot_schedule_class(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/live-classes/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_time_rejected(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'start_time': '11:00:00', 'end_time': '10:00:00'}
        response = self.client.post('/api/v1/live-classes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('end_time', response.data['errors'])

    def test_invalid_url_rejected(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'meeting_url': 'not-a-url'}
        response = self.client.post('/api/v1/live-classes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('meeting_url', response.data['errors'])

    def test_cancel_live_class(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/live-classes/', self.payload, format='json')
        session_id = create_resp.data['data']['id']
        response = self.client.post(f'/api/v1/live-classes/{session_id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(LiveSession.objects.get(id=session_id).status, 'cancelled')
