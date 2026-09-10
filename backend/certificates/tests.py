from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory
from enrollments.models import Enrollment
from progress import badges

from .models import Badge, Certificate, UserBadge

User = get_user_model()


class BadgeAwardingTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Music')
        self.instructor = User.objects.create_user(
            username='badgeinstructor', email='badgeinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='badgestudent', email='badgestudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(title='Piano 101', category=self.category, instructor=self.instructor)

    def test_badge_catalog_is_seeded(self):
        self.assertEqual(Badge.objects.count(), 5)
        self.assertTrue(Badge.objects.filter(trigger=Badge.Trigger.FIRST_COURSE_COMPLETED).exists())

    def test_first_course_completion_awards_two_badges(self):
        Enrollment.objects.create(student=self.student, course=self.course, status=Enrollment.Status.COMPLETED)
        badges.check_completion_badges(self.student, self.course)
        triggers = set(UserBadge.objects.filter(user=self.student).values_list('badge__trigger', flat=True))
        self.assertIn(Badge.Trigger.FIRST_COURSE_COMPLETED, triggers)
        self.assertIn(Badge.Trigger.COURSE_COMPLETED, triggers)

    def test_badge_not_awarded_twice(self):
        Enrollment.objects.create(student=self.student, course=self.course, status=Enrollment.Status.COMPLETED)
        badges.check_completion_badges(self.student, self.course)
        badges.check_completion_badges(self.student, self.course)
        count = UserBadge.objects.filter(
            user=self.student, badge__trigger=Badge.Trigger.FIRST_COURSE_COMPLETED,
        ).count()
        self.assertEqual(count, 1)

    def test_perfect_quiz_score_awards_badge(self):
        badges.check_quiz_score_badge(self.student, self.course, 100)
        self.assertTrue(
            UserBadge.objects.filter(user=self.student, badge__trigger=Badge.Trigger.PERFECT_QUIZ_SCORE).exists()
        )

    def test_imperfect_quiz_score_does_not_award_badge(self):
        badges.check_quiz_score_badge(self.student, self.course, 80)
        self.assertFalse(
            UserBadge.objects.filter(user=self.student, badge__trigger=Badge.Trigger.PERFECT_QUIZ_SCORE).exists()
        )

    def test_student_can_list_own_badges(self):
        Enrollment.objects.create(student=self.student, course=self.course, status=Enrollment.Status.COMPLETED)
        badges.check_completion_badges(self.student, self.course)
        self.client.force_authenticate(self.student)
        response = self.client.get('/api/v1/certificates/badges/mine/')
        rows = response.data.get('results') if isinstance(response.data, dict) else response.data
        self.assertGreaterEqual(len(rows), 1)


class CertificateExpirationTests(APITestCase):
    def setUp(self):
        self.category = CourseCategory.objects.create(name='Safety')
        self.instructor = User.objects.create_user(
            username='certinstructor', email='certinstructor@test.com', password='Pass1234!', user_type='instructor'
        )
        self.student = User.objects.create_user(
            username='certstudent', email='certstudent@test.com', password='Pass1234!', user_type='student'
        )
        self.course = Course.objects.create(
            title='Fire Safety Certification', category=self.category, instructor=self.instructor,
            certificate_validity_months=12,
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student, course=self.course, status=Enrollment.Status.COMPLETED,
        )

    def test_issuing_certificate_sets_expiry_from_course_validity(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/certificates/', {'enrollment': self.enrollment.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertIsNotNone(response.data['expires_at'])
        self.assertFalse(response.data['is_expired'])

    def test_expired_certificate_flagged_and_fails_verification(self):
        certificate = Certificate.objects.create(
            student=self.student, course=self.course, enrollment=self.enrollment,
            expires_at=timezone.localdate() - timedelta(days=1),
        )
        self.assertTrue(certificate.is_expired)
        response = self.client.post(
            '/api/v1/certificates/verify/', {'verification_code': certificate.verification_code}, format='json'
        )
        self.assertFalse(response.data['valid'])
        self.assertEqual(response.data['status'], 'expired')

    def test_renew_extends_expiry_and_reactivates(self):
        certificate = Certificate.objects.create(
            student=self.student, course=self.course, enrollment=self.enrollment,
            expires_at=timezone.localdate() - timedelta(days=1), status=Certificate.Status.EXPIRED,
        )
        self.client.force_authenticate(self.instructor)
        response = self.client.post(f'/api/v1/certificates/{certificate.id}/renew/')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['status'], 'active')
        self.assertEqual(response.data['data']['renewal_count'], 1)
        certificate.refresh_from_db()
        self.assertFalse(certificate.is_expired)

    def test_course_with_no_validity_never_expires(self):
        self.course.certificate_validity_months = None
        self.course.save()
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/certificates/', {'enrollment': self.enrollment.id}, format='json')
        self.assertIsNone(response.data['expires_at'])

    def test_renew_rejected_for_never_expiring_certificate(self):
        self.course.certificate_validity_months = None
        self.course.save()
        certificate = Certificate.objects.create(student=self.student, course=self.course, enrollment=self.enrollment)
        self.client.force_authenticate(self.instructor)
        response = self.client.post(f'/api/v1/certificates/{certificate.id}/renew/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
