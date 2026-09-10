from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import Assignment, AssignmentSubmission, Rubric

User = get_user_model()


class AssignmentCreationTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Business')
        self.instructor = User.objects.create_user(
            username='ainstructor', email='ainstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='astudent', email='astudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Intro to Business', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.payload = {
            'course': self.course.id,
            'title': 'Business Plan Draft',
            'description': 'Write a one-page business plan.',
            'instructions': 'Include market analysis.',
            'maximum_marks': 100,
            'passing_marks': 50,
            'due_date': (timezone.now() + timezone.timedelta(days=7)).isoformat(),
            'submission_type': 'text',
            'allow_late_submission': True,
            'late_penalty': '10.00',
        }

    def test_instructor_can_create_assignment(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/assignments/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data['success'])

    def test_student_cannot_create_assignment(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/assignments/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_maximum_marks_validated(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'maximum_marks': 0}
        response = self.client.post('/api/v1/assignments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_passing_marks_validated(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload, 'passing_marks': 150}
        response = self.client.post('/api/v1/assignments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('passing_marks', response.data['errors'])

    def test_due_date_required(self):
        self.client.force_authenticate(self.instructor)
        payload = {**self.payload}
        del payload['due_date']
        response = self.client.post('/api/v1/assignments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('due_date', response.data['errors'])


class RubricGradingTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Writing')
        self.instructor = User.objects.create_user(
            username='rubinstructor', email='rubinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='rubstudent', email='rubstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Essay Writing', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.assignment = Assignment.objects.create(
            course=self.course, title='Persuasive Essay', maximum_marks=20, passing_marks=10,
            due_date=timezone.now() + timezone.timedelta(days=7), created_by=self.instructor,
        )
        self.submission = AssignmentSubmission.objects.create(
            assignment=self.assignment, student=self.student, submission_text='My essay draft.',
        )

    def test_instructor_can_create_rubric_with_criteria(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            '/api/v1/assignments/rubrics/',
            {
                'title': 'Essay Rubric',
                'criteria': [
                    {'title': 'Thesis clarity', 'max_points': 10, 'order': 0},
                    {'title': 'Grammar', 'max_points': 10, 'order': 1},
                ],
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(len(response.data['data']['criteria']), 2)
        self.assertEqual(response.data['data']['total_points'], 20)

    def test_student_cannot_create_rubric(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/assignments/rubrics/', {'title': 'Nope'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_grade_with_rubric_scores_is_persisted(self):
        rubric = Rubric.objects.create(title='Essay Rubric', created_by=self.instructor)
        criterion = rubric.criteria.create(title='Thesis clarity', max_points=10, order=0)
        self.assignment.rubric = rubric
        self.assignment.save()

        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f'/api/v1/assignments/submissions/{self.submission.id}/grade/',
            {'marks_awarded': 8, 'feedback': 'Solid thesis.', 'rubric_scores': {str(criterion.id): 8}},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['rubric_scores'], {str(criterion.id): 8})
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.rubric_scores, {str(criterion.id): 8})
