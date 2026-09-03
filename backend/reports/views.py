from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from certificates.models import Certificate
from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Payment
from reviews.models import CourseReview
from support.models import SupportTicket

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        revenue = Payment.objects.filter(payment_status='successful').aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'total_users': User.objects.count(),
            'total_students': User.objects.filter(user_type='student').count(),
            'total_instructors': User.objects.filter(user_type='instructor').count(),
            'total_courses': Course.objects.count(),
            'published_courses': Course.objects.filter(status='published').count(),
            'draft_courses': Course.objects.filter(status='draft').count(),
            'total_enrollments': Enrollment.objects.count(),
            'active_enrollments': Enrollment.objects.filter(status='active').count(),
            'completed_enrollments': Enrollment.objects.filter(status='completed').count(),
            'certificates_issued': Certificate.objects.count(),
            'total_revenue': revenue,
            'open_support_tickets': SupportTicket.objects.filter(status__in=['open', 'in_progress']).count(),
            'top_courses': list(
                Course.objects.annotate(enrollment_count=Count('enrollments'))
                .order_by('-enrollment_count')
                .values('id', 'title', 'enrollment_count')[:5]
            ),
        })


class InstructorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type not in ('instructor', 'admin') and not user.is_staff:
            return Response({'detail': 'Instructors only.'}, status=403)

        courses = Course.objects.filter(instructor=user)
        enrollments = Enrollment.objects.filter(course__instructor=user)
        avg_rating = CourseReview.objects.filter(course__instructor=user, status='approved').aggregate(
            avg=Avg('rating')
        )['avg']

        return Response({
            'total_courses': courses.count(),
            'published_courses': courses.filter(status='published').count(),
            'total_students': enrollments.values('student').distinct().count(),
            'total_enrollments': enrollments.count(),
            'average_rating': round(avg_rating, 2) if avg_rating else None,
            'certificates_issued': Certificate.objects.filter(course__instructor=user).count(),
            'courses': list(
                courses.annotate(enrollment_count=Count('enrollments')).values(
                    'id', 'title', 'status', 'enrollment_count'
                )
            ),
        })


class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user)
        return Response({
            'total_enrollments': enrollments.count(),
            'active_courses': enrollments.filter(status='active').count(),
            'completed_courses': enrollments.filter(status='completed').count(),
            'certificates_earned': Certificate.objects.filter(student=user).count(),
            'average_progress': round(
                enrollments.aggregate(avg=Avg('completion_percentage'))['avg'] or 0, 2
            ),
            'courses': list(
                enrollments.values('course__id', 'course__title', 'status', 'completion_percentage')
            ),
        })
