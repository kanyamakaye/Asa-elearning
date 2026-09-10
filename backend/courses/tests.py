from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course, CourseCategory

User = get_user_model()


class CourseCreationTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Web Development')
        self.instructor = User.objects.create_user(
            username='instructor1', email='instructor1@test.com', password='Pass1234!', user_type='instructor'
        )
        self.other_instructor = User.objects.create_user(
            username='instructor2', email='instructor2@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='student1', email='student1@test.com', password='Pass1234!', user_type='student'
        )
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@test.com', password='Pass1234!', user_type='admin'
        )
        self.payload = {
            'title': 'Full Stack Web Development',
            'course_code': 'WEB-101',
            'short_description': 'Learn modern web development.',
            'description': 'Complete web development course.',
            'category_id': self.category.id,
            'level': 'beginner',
            'language': 'English',
            'price': '150.00',
            'discount_price': '120.00',
            'duration_hours': 40,
            'visibility': 'public',
            'requirements': ['Basic computer knowledge'],
            'learning_objectives': ['Build web applications'],
        }

    def test_instructor_can_create_course(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/courses/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['title'], self.payload['title'])
        course = Course.objects.get(course_code='WEB-101')
        self.assertEqual(course.instructor_id, self.instructor.id)

    def test_admin_can_create_course(self):
        self.client.force_authenticate(self.admin)
        payload = {**self.payload, 'course_code': 'WEB-102'}
        response = self.client.post('/api/v1/courses/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/courses/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_create_course(self):
        response = self.client.post('/api/v1/courses/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_required_fields_validated(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/courses/', {'title': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('errors', response.data)

    def test_course_code_must_be_unique(self):
        self.client.force_authenticate(self.instructor)
        self.client.post('/api/v1/courses/', self.payload, format='json')
        response = self.client.post('/api/v1/courses/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('course_code', response.data['errors'])

    def test_discount_price_cannot_exceed_price(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'discount_price': '999.00'}
        response = self.client.post('/api/v1/courses/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_instructor_cannot_edit_another_instructors_course(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/courses/', self.payload, format='json')
        slug = create_resp.data['data']['slug']

        self.client.force_authenticate(self.other_instructor)
        response = self.client.patch(f'/api/v1/courses/{slug}/', {'title': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_can_edit_own_course(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/courses/', self.payload, format='json')
        slug = create_resp.data['data']['slug']
        response = self.client.patch(f'/api/v1/courses/{slug}/', {'title': 'Updated Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['title'], 'Updated Title')

    def test_publish_course(self):
        self.client.force_authenticate(self.instructor)
        create_resp = self.client.post('/api/v1/courses/', self.payload, format='json')
        slug = create_resp.data['data']['slug']
        response = self.client.post(f'/api/v1/courses/{slug}/publish/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], 'published')

    def test_create_course_with_thumbnail_url(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'course_code': 'WEB-103', 'thumbnail_url': 'https://example.com/thumb.jpg'}
        response = self.client.post('/api/v1/courses/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['data']['thumbnail_url'], 'https://example.com/thumb.jpg')

    def test_invalid_thumbnail_url_rejected(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'course_code': 'WEB-104', 'thumbnail_url': 'not-a-url'}
        response = self.client.post('/api/v1/courses/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('thumbnail_url', response.data['errors'])

    def test_thumbnail_url_takes_priority_over_uploaded_image_in_responses(self):
        course = Course.objects.create(
            title='Priority Test', course_code='WEB-105', instructor=self.instructor,
            thumbnail_url='https://example.com/from-url.jpg',
        )
        self.client.force_authenticate(self.instructor)
        response = self.client.get(f'/api/v1/courses/{course.slug}/')
        self.assertEqual(response.data['image'], 'https://example.com/from-url.jpg')
        self.assertEqual(response.data['thumbnail'], 'https://example.com/from-url.jpg')

    def test_no_thumbnail_url_falls_back_to_null_image(self):
        course = Course.objects.create(title='No Thumb', course_code='WEB-106', instructor=self.instructor)
        self.client.force_authenticate(self.instructor)
        response = self.client.get(f'/api/v1/courses/{course.slug}/')
        self.assertIsNone(response.data['image'])
        self.assertIsNone(response.data['thumbnail'])


class CoursePrerequisiteTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Design')
        self.instructor = User.objects.create_user(
            username='preqcinstructor', email='preqcinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.course_a = Course.objects.create(
            title='Design Basics', course_code='DES-101', instructor=self.instructor, duration_hours=10,
        )
        self.course_b = Course.objects.create(
            title='Design Intermediate', course_code='DES-102', instructor=self.instructor,
            prerequisite=self.course_a, duration_hours=10,
        )

    def test_course_cannot_be_its_own_prerequisite(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.patch(
            f'/api/v1/courses/{self.course_a.slug}/', {'prerequisite': self.course_a.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_two_course_prerequisite_cycle_rejected(self):
        self.client.force_authenticate(self.instructor)
        # B already requires A — making A require B would be a 2-cycle.
        response = self.client.patch(
            f'/api/v1/courses/{self.course_a.slug}/', {'prerequisite': self.course_b.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('prerequisite', response.data['errors'])

    def test_valid_prerequisite_chain_allowed(self):
        course_c = Course.objects.create(
            title='Design Advanced', course_code='DES-103', instructor=self.instructor, duration_hours=10,
        )
        self.client.force_authenticate(self.instructor)
        response = self.client.patch(
            f'/api/v1/courses/{course_c.slug}/', {'prerequisite': self.course_b.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
