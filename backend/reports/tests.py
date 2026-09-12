from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, CourseCategory
from payments.models import Payment

from .views import _percent_change

User = get_user_model()


class PercentChangeTests(APITestCase):
    def test_increase(self):
        self.assertEqual(_percent_change(150, 100), 50.0)

    def test_decrease(self):
        self.assertEqual(_percent_change(50, 100), -50.0)

    def test_zero_previous_with_current_value_is_100_percent(self):
        self.assertEqual(_percent_change(10, 0), 100.0)

    def test_both_zero_is_no_change(self):
        self.assertEqual(_percent_change(0, 0), 0.0)


class AdminDashboardPortfolioTests(APITestCase):
    """The dashboard's filter bar (category/level/instructor) and the
    Portfolio Summary / Executive KPIs blocks it drives."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username='padmin', email='padmin@test.com', password='Pass1234!', user_type='admin',
        )
        self.instructor = User.objects.create_user(
            username='pinstructor', email='pinstructor@test.com', password='Pass1234!', user_type='instructor',
        )
        self.student = User.objects.create_user(
            username='pstudent', email='pstudent@test.com', password='Pass1234!', user_type='student',
        )
        self.category = CourseCategory.objects.create(name='Portfolio Category')
        self.beginner_course = Course.objects.create(
            title='Beginner Course', category=self.category, instructor=self.instructor,
            level=Course.Level.BEGINNER, status=Course.Status.PUBLISHED, price=Decimal('50'),
        )
        self.advanced_course = Course.objects.create(
            title='Advanced Course', category=self.category, instructor=self.instructor,
            level=Course.Level.ADVANCED, status=Course.Status.DRAFT, price=Decimal('50'),
        )
        Payment.objects.create(
            student=self.student, course=self.beginner_course, amount=Decimal('50'),
            payment_status=Payment.Status.SUCCESSFUL,
        )

    def test_student_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(self.student)
        response = self.client.get('/api/v1/dashboard/admin/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unfiltered_portfolio_summary_covers_all_courses(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/dashboard/admin/')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        summary = response.data['portfolio_summary']
        self.assertEqual(summary['total_courses'], 2)
        self.assertEqual(summary['active_courses'], 1)
        self.assertEqual(summary['pending_review'], 1)

    def test_level_filter_narrows_portfolio_summary_and_kpis(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/dashboard/admin/', {'level': 'beginner'})
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        summary = response.data['portfolio_summary']
        self.assertEqual(summary['total_courses'], 1)
        self.assertEqual(summary['pending_review'], 0)
        self.assertEqual(response.data['executive_kpis']['total_revenue']['value'], Decimal('50'))

    def test_category_filter_excludes_other_categories(self):
        other_category = CourseCategory.objects.create(name='Other Category')
        Course.objects.create(
            title='Other Category Course', category=other_category, instructor=self.instructor,
            status=Course.Status.PUBLISHED,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/dashboard/admin/', {'category': self.category.slug})
        self.assertEqual(response.data['portfolio_summary']['total_courses'], 2)

    def test_filter_options_list_categories_levels_and_instructors(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/dashboard/admin/')
        options = response.data['filter_options']
        self.assertIn(self.category.slug, [c['slug'] for c in options['categories']])
        self.assertEqual({lvl['value'] for lvl in options['levels']}, {'beginner', 'intermediate', 'advanced'})
        self.assertIn(self.instructor.id, [i['id'] for i in options['instructors']])
