from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import Enrollment

User = get_user_model()


class PrerequisiteEnforcementTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Programming')
        self.instructor = User.objects.create_user(
            username='preqinstructor', email='preqinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='preqstudent', email='preqstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.basics = Course.objects.create(
            title='Python Basics', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.advanced = Course.objects.create(
            title='Advanced Python', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED, prerequisite=self.basics,
        )

    def test_cannot_enroll_without_completing_prerequisite(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/enrollments/', {'course': self.advanced.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Python Basics', str(response.data['course']))

    def test_can_enroll_after_completing_prerequisite(self):
        Enrollment.objects.create(student=self.student, course=self.basics, status=Enrollment.Status.COMPLETED)
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/enrollments/', {'course': self.advanced.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_in_progress_prerequisite_is_not_enough(self):
        Enrollment.objects.create(student=self.student, course=self.basics, status=Enrollment.Status.ACTIVE)
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/enrollments/', {'course': self.advanced.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_course_without_prerequisite_enrolls_freely(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/enrollments/', {'course': self.basics.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
