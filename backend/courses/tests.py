from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from assessments.models import Quiz
from assignments.models import Assignment
from enrollments.models import Enrollment
from groups.models import GroupCourseAssignment, StudentGroup, StudentGroupMembership

from .access import can_access_course
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


class GroupCourseAccessTests(APITestCase):
    """Group.md — Student Group and Course Access Management. Exercises the
    centralized can_access_course() authorization both as a unit and at the
    actual API boundary (learn/quiz-start/assignment-submit), per the
    project's group/enrollment interaction rules:
      - a course with no group assigned behaves exactly as before
        (enrollment-only access, unaffected by this feature);
      - a course assigned to >=1 group grants access via EITHER an
        enrollment OR membership in any one of its assigned groups (OR
        semantics across multiple groups, and group membership is an
        additional path alongside enrollment, not a replacement for it);
      - removing a student from a group revokes only the access that came
        from that group — an independent enrollment, or membership in a
        second group also assigned to the same course, still grants access.
    """

    def setUp(self):
        self.category = CourseCategory.objects.create(name='Restricted')
        self.instructor = User.objects.create_user(
            username='gcinstructor', email='gcinstructor@test.com', password='Pass1234!', user_type='instructor',
        )
        self.admin = User.objects.create_user(
            username='gcadmin', email='gcadmin@test.com', password='Pass1234!', user_type='admin',
        )
        self.member = User.objects.create_user(
            username='gcmember', email='gcmember@test.com', password='Pass1234!', user_type='student',
        )
        self.outsider = User.objects.create_user(
            username='gcoutsider', email='gcoutsider@test.com', password='Pass1234!', user_type='student',
        )
        self.restricted_course = Course.objects.create(
            title='Group Only Course', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.open_course = Course.objects.create(
            title='Ungrouped Course', category=self.category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.group = StudentGroup.objects.create(
            name='Cohort A', instructor=self.instructor, created_by=self.instructor,
        )
        GroupCourseAssignment.objects.create(group=self.group, course=self.restricted_course)
        StudentGroupMembership.objects.create(group=self.group, student=self.member)

    # -- unit-level: can_access_course() ---------------------------------

    def test_ungrouped_course_is_enrollment_only_unaffected_by_feature(self):
        """A course with zero group assignments must behave exactly as
        before this feature existed — backward compatibility (Group.md
        §12/§31): no enrollment, no group => denied; enroll => allowed."""
        self.assertFalse(can_access_course(self.outsider, self.open_course))
        Enrollment.objects.create(student=self.outsider, course=self.open_course)
        self.assertTrue(can_access_course(self.outsider, self.open_course))

    def test_group_member_can_access_restricted_course_without_enrollment(self):
        self.assertFalse(Enrollment.objects.filter(student=self.member, course=self.restricted_course).exists())
        self.assertTrue(can_access_course(self.member, self.restricted_course))

    def test_non_member_denied_restricted_course(self):
        self.assertFalse(can_access_course(self.outsider, self.restricted_course))

    def test_enrollment_still_grants_access_to_a_restricted_course(self):
        """Enrollment is a parallel, independent access path — being
        group-restricted never revokes an existing enrollment's access."""
        Enrollment.objects.create(student=self.outsider, course=self.restricted_course)
        self.assertTrue(can_access_course(self.outsider, self.restricted_course))

    def test_removing_group_membership_revokes_group_derived_access(self):
        StudentGroupMembership.objects.filter(group=self.group, student=self.member).delete()
        self.assertFalse(can_access_course(self.member, self.restricted_course))

    def test_removing_one_of_two_groups_keeps_access_via_the_other(self):
        other_group = StudentGroup.objects.create(
            name='Cohort B', instructor=self.instructor, created_by=self.instructor,
        )
        GroupCourseAssignment.objects.create(group=other_group, course=self.restricted_course)
        StudentGroupMembership.objects.create(group=other_group, student=self.member)

        StudentGroupMembership.objects.filter(group=self.group, student=self.member).delete()
        self.assertTrue(can_access_course(self.member, self.restricted_course))

        StudentGroupMembership.objects.filter(group=other_group, student=self.member).delete()
        self.assertFalse(can_access_course(self.member, self.restricted_course))

    def test_admin_and_owning_instructor_always_have_access(self):
        self.assertTrue(can_access_course(self.admin, self.restricted_course))
        self.assertTrue(can_access_course(self.instructor, self.restricted_course))

    # -- API boundary: the actual endpoints must enforce the same rule ----

    def test_learn_endpoint_denies_non_member(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.get(f'/api/v1/courses/{self.restricted_course.slug}/learn/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_learn_endpoint_allows_group_member(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(f'/api/v1/courses/{self.restricted_course.slug}/learn/')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    def test_learn_endpoint_denies_after_removal_even_with_existing_session(self):
        """Authorization is re-evaluated from current server-side state on
        every request — there is no cached/stale permission to invalidate."""
        self.client.force_authenticate(self.member)
        ok = self.client.get(f'/api/v1/courses/{self.restricted_course.slug}/learn/')
        self.assertEqual(ok.status_code, status.HTTP_200_OK)

        StudentGroupMembership.objects.filter(group=self.group, student=self.member).delete()

        denied = self.client.get(f'/api/v1/courses/{self.restricted_course.slug}/learn/')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_bypass_via_direct_courseid_on_quiz_start(self):
        """Parameter-tampering scenario (Group.md §23): a student who does
        have access to some course cannot start a quiz that belongs to a
        different, group-restricted course they aren't authorized for."""
        quiz = Quiz.objects.create(
            course=self.restricted_course, title='Restricted Quiz', status=Quiz.Status.PUBLISHED,
        )
        self.client.force_authenticate(self.outsider)
        response = self.client.post(f'/api/v1/quizzes/{quiz.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_member_can_start_quiz_in_restricted_course(self):
        quiz = Quiz.objects.create(
            course=self.restricted_course, title='Restricted Quiz', status=Quiz.Status.PUBLISHED,
        )
        self.client.force_authenticate(self.member)
        response = self.client.post(f'/api/v1/quizzes/{quiz.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_non_member_cannot_submit_assignment_in_restricted_course(self):
        assignment = Assignment.objects.create(
            course=self.restricted_course, title='Restricted Assignment', status=Assignment.Status.PUBLISHED,
        )
        self.client.force_authenticate(self.outsider)
        response = self.client.post(
            f'/api/v1/assignments/{assignment.id}/submit/', {'submission_text': 'Attempted bypass'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
