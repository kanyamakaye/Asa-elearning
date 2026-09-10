from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory

from .models import StudentGroup, StudentGroupMembership

User = get_user_model()


class StudentGroupTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Cohorts')
        self.instructor = User.objects.create_user(
            username='ginstructor', email='ginstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.other_instructor = User.objects.create_user(
            username='ginstructor2', email='ginstructor2@test.com', password='Pass1234!', user_type='instructor'
        )
        self.admin = User.objects.create_user(
            username='gadmin', email='gadmin@test.com', password='Pass1234!', user_type='admin'
        )
        self.student = User.objects.create_user(
            username='gstudent1', email='gstudent1@test.com', password='Pass1234!', user_type='student'
        )
        self.other_student = User.objects.create_user(
            username='gstudent2', email='gstudent2@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(title='Cohort Course', category=self.category, instructor=self.instructor)

    def test_instructor_can_create_group(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            '/api/v1/groups/', {'name': 'Morning Cohort', 'course': self.course.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['data']['instructor'], self.instructor.id)

    def test_student_cannot_create_group(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/groups/', {'name': 'Nope'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_cannot_scope_group_to_another_instructors_course(self):
        other_course = Course.objects.create(title='Other Course', category=self.category, instructor=self.other_instructor)
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/groups/', {'name': 'Sneaky', 'course': other_course.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_instructor_can_add_and_remove_members(self):
        group = StudentGroup.objects.create(name='Cohort A', course=self.course, instructor=self.instructor, created_by=self.instructor)
        self.client.force_authenticate(self.instructor)

        add = self.client.post(f'/api/v1/groups/{group.id}/add-member/', {'student_id': self.student.id}, format='json')
        self.assertEqual(add.status_code, status.HTTP_201_CREATED, add.data)
        self.assertTrue(StudentGroupMembership.objects.filter(group=group, student=self.student).exists())

        duplicate = self.client.post(f'/api/v1/groups/{group.id}/add-member/', {'student_id': self.student.id}, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        remove = self.client.post(f'/api/v1/groups/{group.id}/remove-member/', {'student_id': self.student.id}, format='json')
        self.assertEqual(remove.status_code, status.HTTP_200_OK, remove.data)
        self.assertFalse(StudentGroupMembership.objects.filter(group=group, student=self.student).exists())

    def test_other_instructor_cannot_manage_group_membership(self):
        group = StudentGroup.objects.create(name='Cohort A', course=self.course, instructor=self.instructor, created_by=self.instructor)
        self.client.force_authenticate(self.other_instructor)
        # Scoped out of get_queryset entirely (not their group, not their
        # course) — get_object() 404s before any object-permission check runs.
        response = self.client.post(f'/api/v1/groups/{group.id}/add-member/', {'student_id': self.student.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_only_sees_groups_they_belong_to(self):
        my_group = StudentGroup.objects.create(name='My Group', course=self.course, instructor=self.instructor, created_by=self.instructor)
        other_group = StudentGroup.objects.create(name='Other Group', course=self.course, instructor=self.instructor, created_by=self.instructor)
        StudentGroupMembership.objects.create(group=my_group, student=self.student)
        StudentGroupMembership.objects.create(group=other_group, student=self.other_student)

        self.client.force_authenticate(self.student)
        response = self.client.get('/api/v1/groups/')
        ids = [g['id'] for g in (response.data.get('results') if isinstance(response.data, dict) else response.data)]
        self.assertIn(my_group.id, ids)
        self.assertNotIn(other_group.id, ids)

    def test_admin_sees_every_group(self):
        StudentGroup.objects.create(name='A', instructor=self.instructor, created_by=self.instructor)
        StudentGroup.objects.create(name='B', instructor=self.other_instructor, created_by=self.other_instructor)
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/groups/')
        rows = response.data.get('results') if isinstance(response.data, dict) else response.data
        self.assertEqual(len(rows), 2)
