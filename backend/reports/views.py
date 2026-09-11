import shutil
import time
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from accounts.permissions import (
    IsAdmin,
    IsAdminOrAcademicManager,
    IsAdminOrContentManager,
    IsAdminOrSupportStaff,
)
from assessments.models import Exam, Quiz, QuizAttempt
from assignments.models import Assignment, AssignmentSubmission
from certificates.models import Certificate
from courses.models import Course, CourseCategory, CourseModule
from discussions.models import DiscussionReply
from enrollments.models import Enrollment
from lessons.models import Lesson, LearningResource
from live_classes.models import LiveSession
from notifications.models import Notification
from payments.models import Payment
from progress.models import LessonProgress
from reviews.models import CourseReview
from support.models import SupportTicket

User = get_user_model()

# Approximates "server start" for an uptime readout — set once when this
# module is first imported (i.e. when the Django process boots).
SERVER_STARTED_AT = timezone.now()


def last_n_month_starts(n):
    """The first-of-month date for each of the last `n` months, oldest first."""
    today = timezone.now().date()
    months = []
    for i in range(n - 1, -1, -1):
        month_index = today.month - 1 - i
        year = today.year + month_index // 12
        month = month_index % 12 + 1
        months.append(today.replace(year=year, month=month, day=1))
    return months


def user_summary(user):
    return {'id': user.id, 'name': user.full_name, 'role': user.user_type}


def recent_activity_feed(*, include_payments=True, limit=12):
    """A unified, best-effort activity feed combining several recent record types."""
    items = []

    for u in User.objects.order_by('-date_joined')[:5]:
        items.append({
            'type': 'user_registered',
            'title': f'{u.full_name} joined as {u.get_user_type_display()}',
            'timestamp': u.date_joined,
        })
    for c in Course.objects.select_related('instructor').order_by('-created_at')[:5]:
        items.append({
            'type': 'course_created',
            'title': f'"{c.title}" published by {c.instructor.full_name}',
            'timestamp': c.created_at,
        })
    for e in Enrollment.objects.select_related('student', 'course').order_by('-created_at')[:5]:
        items.append({
            'type': 'enrollment',
            'title': f'{e.student.full_name} enrolled in "{e.course.title}"',
            'timestamp': e.created_at,
        })
    if include_payments:
        for p in Payment.objects.select_related('student', 'course').order_by('-created_at')[:5]:
            items.append({
                'type': 'payment',
                'title': f'{p.student.full_name} paid {p.currency} {p.amount} for "{p.course.title}"',
                'timestamp': p.created_at,
            })
    for t in SupportTicket.objects.select_related('user').order_by('-created_at')[:5]:
        items.append({
            'type': 'support_ticket',
            'title': f'{t.user.full_name} opened a ticket: {t.subject}',
            'timestamp': t.created_at,
        })

    items.sort(key=lambda i: i['timestamp'], reverse=True)
    return items[:limit]


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        request_started = time.monotonic()

        since_14d = timezone.now() - timedelta(days=14)
        revenue_agg = Payment.objects.filter(payment_status='successful').aggregate(total=Sum('amount'))
        pending_payments = Payment.objects.filter(payment_status='pending').count()

        # -- User Growth: cumulative students/instructors/total, last 12 months --
        month_starts = last_n_month_starts(12)
        since_12m_start = month_starts[0]
        baseline_students = User.objects.filter(
            user_type='student', date_joined__date__lt=since_12m_start
        ).count()
        baseline_instructors = User.objects.filter(
            user_type='instructor', date_joined__date__lt=since_12m_start
        ).count()
        baseline_total = User.objects.filter(date_joined__date__lt=since_12m_start).count()

        monthly_signups = {
            row['month'].date(): row
            for row in (
                User.objects.filter(date_joined__date__gte=since_12m_start)
                .annotate(month=TruncMonth('date_joined'))
                .values('month')
                .annotate(
                    students=Count('id', filter=Q(user_type='student')),
                    instructors=Count('id', filter=Q(user_type='instructor')),
                    total=Count('id'),
                )
            )
        }

        user_growth = []
        running_students, running_instructors, running_total = (
            baseline_students, baseline_instructors, baseline_total,
        )
        for month_start in month_starts:
            row = monthly_signups.get(month_start, {})
            running_students += row.get('students', 0)
            running_instructors += row.get('instructors', 0)
            running_total += row.get('total', 0)
            user_growth.append({
                'month': month_start.isoformat(),
                'students': running_students,
                'instructors': running_instructors,
                'total_users': running_total,
            })

        # -- Enrollments vs Completions, last 12 months --
        monthly_enrollments = {
            row['month'].date(): row
            for row in (
                Enrollment.objects.filter(created_at__date__gte=since_12m_start)
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(
                    new=Count('id'),
                    completed=Count('id', filter=Q(status=Enrollment.Status.COMPLETED)),
                    cancelled=Count('id', filter=Q(status=Enrollment.Status.CANCELLED)),
                )
            )
        }
        enrollment_trend = [
            {
                'month': month_start.isoformat(),
                'new': monthly_enrollments.get(month_start, {}).get('new', 0),
                'completed': monthly_enrollments.get(month_start, {}).get('completed', 0),
                'cancelled': monthly_enrollments.get(month_start, {}).get('cancelled', 0),
            }
            for month_start in month_starts
        ]

        revenue_trend = (
            Payment.objects.filter(payment_status='successful', created_at__gte=since_14d)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(transactions=Count('id'), revenue=Sum('amount'))
            .order_by('day')
        )

        # -- Course Categories breakdown --
        category_breakdown = list(
            CourseCategory.objects.annotate(course_count=Count('courses'))
            .filter(course_count__gt=0)
            .order_by('-course_count')
            .values('name', 'course_count')[:7]
        )
        uncategorized_count = Course.objects.filter(category__isnull=True).count()
        if uncategorized_count:
            category_breakdown.append({'name': 'Uncategorized', 'course_count': uncategorized_count})

        top_courses = list(
            Course.objects.annotate(
                enrollment_count=Count('enrollments', distinct=True),
                avg_rating=Avg('reviews__rating', filter=Q(reviews__status='approved')),
            )
            .order_by('-enrollment_count')
            .values('id', 'title', 'enrollment_count', 'avg_rating')[:5]
        )

        # -- Upcoming Live Classes --
        today = timezone.now().date()
        upcoming_live_classes = list(
            LiveSession.objects.filter(status=LiveSession.Status.SCHEDULED, scheduled_date__gte=today)
            .select_related('course', 'instructor')
            .order_by('scheduled_date', 'start_time')
            .values(
                'id', 'title', 'scheduled_date', 'start_time', 'end_time',
                'course__title', 'instructor__first_name', 'instructor__last_name',
            )[:5]
        )

        # -- Recent Registrations --
        recent_registrations = list(
            User.objects.order_by('-date_joined').values(
                'id', 'first_name', 'last_name', 'email', 'user_type', 'date_joined',
            )[:8]
        )

        # -- System Overview: real, cheaply-computed operational metrics --
        disk_total, _disk_used, disk_free = shutil.disk_usage(settings.BASE_DIR)
        storage_usage_percent = round((1 - disk_free / disk_total) * 100, 1) if disk_total else 0
        blacklisted_ids = BlacklistedToken.objects.values_list('token_id', flat=True)
        active_sessions = (
            OutstandingToken.objects.filter(expires_at__gte=timezone.now())
            .exclude(id__in=blacklisted_ids)
            .count()
        )
        system_overview = {
            'storage_usage_percent': storage_usage_percent,
            'active_sessions': active_sessions,
            'uptime_seconds': int((timezone.now() - SERVER_STARTED_AT).total_seconds()),
            'api_response_ms': round((time.monotonic() - request_started) * 1000, 1),
        }

        return Response({
            'user': user_summary(request.user),
            'statistics': {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(status='active').count(),
                'total_students': User.objects.filter(user_type='student').count(),
                'total_instructors': User.objects.filter(user_type='instructor').count(),
                'total_courses': Course.objects.count(),
                'published_courses': Course.objects.filter(status='published').count(),
                'draft_courses': Course.objects.filter(status='draft').count(),
                'active_enrollments': Enrollment.objects.filter(status='active').count(),
                'completed_courses': Enrollment.objects.filter(status='completed').count(),
                'certificates_issued': Certificate.objects.count(),
                'total_revenue': revenue_agg['total'] or 0,
                'pending_payments': pending_payments,
                'open_support_tickets': SupportTicket.objects.filter(status__in=['open', 'in_progress']).count(),
            },
            'charts': {
                'user_growth': user_growth,
                'enrollments': enrollment_trend,
                'revenue': list(revenue_trend),
                'course_categories': category_breakdown,
            },
            'top_courses': top_courses,
            'recent_activity': recent_activity_feed(),
            'recent_registrations': recent_registrations,
            'upcoming_live_classes': upcoming_live_classes,
            'system': system_overview,
        })


class AcademicManagerDashboardView(APIView):
    permission_classes = [IsAdminOrAcademicManager]

    def get(self, request):
        since_6m = timezone.now() - timedelta(days=182)
        enrollment_trend = (
            Enrollment.objects.filter(created_at__gte=since_6m)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(new=Count('id'), completed=Count('id', filter=Q(status=Enrollment.Status.COMPLETED)))
            .order_by('month')
        )
        pending_assessments = (
            AssignmentSubmission.objects.filter(status=AssignmentSubmission.Status.SUBMITTED).count()
            + QuizAttempt.objects.filter(status=QuizAttempt.Status.SUBMITTED).count()
        )
        top_courses = list(
            Course.objects.annotate(enrollment_count=Count('enrollments', distinct=True))
            .order_by('-enrollment_count')
            .values('id', 'title', 'enrollment_count')[:5]
        )

        return Response({
            'user': user_summary(request.user),
            'statistics': {
                'total_courses': Course.objects.count(),
                'active_courses': Course.objects.filter(status='published').count(),
                'total_students': User.objects.filter(user_type='student').count(),
                'active_instructors': User.objects.filter(user_type='instructor', status='active').count(),
                'active_enrollments': Enrollment.objects.filter(status='active').count(),
                'completed_courses': Enrollment.objects.filter(status='completed').count(),
                'pending_assessments': pending_assessments,
                'certificates_issued': Certificate.objects.count(),
            },
            'charts': {'enrollments': list(enrollment_trend)},
            'top_courses': top_courses,
            'recent_activity': recent_activity_feed(include_payments=False),
        })


class InstructorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type not in ('instructor', 'admin') and not user.is_staff:
            return Response({'detail': 'Instructors only.'}, status=403)

        courses = Course.objects.filter(instructor=user)
        course_ids = list(courses.values_list('id', flat=True))
        enrollments = Enrollment.objects.filter(course_id__in=course_ids)
        avg_rating = CourseReview.objects.filter(course_id__in=course_ids, status='approved').aggregate(
            avg=Avg('rating')
        )['avg']

        week_ago = timezone.now() - timedelta(days=7)
        pending_submissions = AssignmentSubmission.objects.filter(
            assignment__course_id__in=course_ids, status=AssignmentSubmission.Status.SUBMITTED
        )
        pending_attempts = QuizAttempt.objects.filter(
            quiz__course_id__in=course_ids, status=QuizAttempt.Status.SUBMITTED
        )
        now = timezone.now()
        upcoming_quizzes = Quiz.objects.filter(
            course_id__in=course_ids, status=Quiz.Status.PUBLISHED
        ).filter(Q(available_until__isnull=True) | Q(available_until__gte=now))
        upcoming_sessions = LiveSession.objects.filter(
            course_id__in=course_ids, status=LiveSession.Status.SCHEDULED, scheduled_date__gte=now.date()
        ).order_by('scheduled_date', 'start_time')

        return Response({
            'user': user_summary(user),
            'statistics': {
                'my_courses': courses.count(),
                'published_courses': courses.filter(status='published').count(),
                'total_students': enrollments.values('student').distinct().count(),
                'new_enrollments': enrollments.filter(created_at__gte=week_ago).count(),
                'pending_assignments': pending_submissions.count(),
                'pending_grades': pending_attempts.count(),
                'upcoming_quizzes': upcoming_quizzes.count(),
                'upcoming_live_classes': upcoming_sessions.count(),
                'average_course_rating': round(avg_rating, 2) if avg_rating else None,
            },
            'courses': list(
                courses.annotate(
                    student_count=Count('enrollments', distinct=True),
                    avg_rating=Avg('reviews__rating', filter=Q(reviews__status='approved')),
                ).values(
                    'id', 'slug', 'title', 'course_code', 'image', 'student_count', 'avg_rating',
                    'status', 'updated_at',
                )
            ),
            'pending_activities': {
                'assignments_to_grade': list(
                    pending_submissions.select_related('assignment', 'student').values(
                        'id', 'assignment__title', 'student__first_name', 'student__last_name', 'submitted_at',
                    )[:8]
                ),
                'quiz_attempts_to_review': list(
                    pending_attempts.select_related('quiz', 'student').values(
                        'id', 'quiz__title', 'student__first_name', 'student__last_name', 'submitted_at',
                    )[:8]
                ),
                'recent_discussion_replies': list(
                    DiscussionReply.objects.filter(topic__course_id__in=course_ids)
                    .select_related('user', 'topic').order_by('-created_at')
                    .values('id', 'topic__title', 'user__first_name', 'user__last_name', 'created_at')[:8]
                ),
                'upcoming_live_classes': list(
                    upcoming_sessions.values('id', 'title', 'course__title', 'scheduled_date', 'start_time')[:5]
                ),
            },
        })


class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user).select_related('course')
        course_ids = list(enrollments.values_list('course_id', flat=True))
        now = timezone.now()

        continue_learning = []
        for enrollment in enrollments.filter(status=Enrollment.Status.ACTIVE).order_by('-updated_at')[:5]:
            latest_progress = (
                LessonProgress.objects.filter(student=user, course=enrollment.course)
                .select_related('lesson').order_by('-last_accessed_at').first()
            )
            continue_learning.append({
                'course_id': enrollment.course.id,
                'course_slug': enrollment.course.slug,
                'course_title': enrollment.course.title,
                'course_image': enrollment.course.image.url if enrollment.course.image else None,
                'instructor': enrollment.course.instructor.full_name,
                'progress_percentage': float(enrollment.completion_percentage),
                'current_lesson': latest_progress.lesson.title if latest_progress else None,
                'last_accessed': latest_progress.last_accessed_at if latest_progress else None,
            })

        submitted_assignment_ids = set(
            AssignmentSubmission.objects.filter(student=user).values_list('assignment_id', flat=True)
        )
        upcoming_assignments_qs = (
            Assignment.objects.filter(course_id__in=course_ids, status=Assignment.Status.PUBLISHED)
            .exclude(id__in=submitted_assignment_ids)
            .order_by('due_date')
        )
        attempted_quiz_ids = set(
            QuizAttempt.objects.filter(student=user).values_list('quiz_id', flat=True)
        )
        upcoming_quizzes_qs = (
            Quiz.objects.filter(course_id__in=course_ids, status=Quiz.Status.PUBLISHED)
            .exclude(id__in=attempted_quiz_ids)
            .filter(Q(available_until__isnull=True) | Q(available_until__gte=now))
        )
        upcoming_exams_qs = Exam.objects.filter(
            course_id__in=course_ids, status=Exam.Status.SCHEDULED
        ).order_by('exam_date')

        # Counts first, on the unsliced querysets, then a combined preview list.
        pending_assignments_count = upcoming_assignments_qs.count()
        upcoming_quizzes_count = upcoming_quizzes_qs.count()
        upcoming_exams_count = upcoming_exams_qs.count()

        upcoming_assessments = (
            [{
                'title': a.title, 'course': a.course.title, 'type': 'assignment',
                'due_date': a.due_date, 'status': 'overdue' if a.due_date and a.due_date < now else 'upcoming',
            } for a in upcoming_assignments_qs[:5]]
            + [{
                'title': q.title, 'course': q.course.title, 'type': 'quiz',
                'due_date': q.available_until, 'status': 'available',
            } for q in upcoming_quizzes_qs[:5]]
            + [{
                'title': e.title, 'course': e.course.title, 'type': 'exam',
                'due_date': e.exam_date, 'status': 'scheduled',
            } for e in upcoming_exams_qs[:5]]
        )

        return Response({
            'user': user_summary(user),
            'statistics': {
                'enrolled_courses': enrollments.count(),
                'active_courses': enrollments.filter(status=Enrollment.Status.ACTIVE).count(),
                'completed_courses': enrollments.filter(status=Enrollment.Status.COMPLETED).count(),
                'average_progress': round(
                    enrollments.aggregate(avg=Avg('completion_percentage'))['avg'] or 0, 2
                ),
                'pending_assignments': pending_assignments_count,
                'upcoming_quizzes': upcoming_quizzes_count,
                'upcoming_exams': upcoming_exams_count,
                'certificates': Certificate.objects.filter(student=user).count(),
            },
            'continue_learning': continue_learning,
            'upcoming_assessments': upcoming_assessments[:8],
            'recent_grades': list(
                user.grades.select_related('course').order_by('-graded_at').values(
                    'course__title', 'assessment_type', 'marks_obtained', 'maximum_marks',
                    'percentage', 'letter_grade', 'graded_at',
                )[:5]
            ),
            'certificates': list(
                Certificate.objects.filter(student=user).select_related('course').values(
                    'id', 'certificate_number', 'course__title', 'issue_date', 'verification_code', 'status',
                )
            ),
            'notifications': list(
                Notification.objects.filter(user=user).order_by('-created_at').values(
                    'id', 'notification_type', 'title', 'message', 'is_read', 'created_at',
                )[:8]
            ),
        })


class ContentManagerDashboardView(APIView):
    permission_classes = [IsAdminOrContentManager]

    def get(self, request):
        return Response({
            'user': user_summary(request.user),
            'statistics': {
                'total_courses': Course.objects.count(),
                'published_courses': Course.objects.filter(status='published').count(),
                'draft_courses': Course.objects.filter(status='draft').count(),
                'total_modules': CourseModule.objects.count(),
                'total_lessons': Lesson.objects.count(),
                'learning_resources': LearningResource.objects.count(),
                'pending_content': (
                    Course.objects.filter(status='draft').count()
                    + Lesson.objects.filter(status=Lesson.Status.DRAFT).count()
                ),
            },
            'recent_courses': list(
                Course.objects.select_related('instructor').order_by('-updated_at').values(
                    'id', 'slug', 'title', 'status', 'instructor__first_name', 'instructor__last_name', 'updated_at',
                )[:8]
            ),
            'recent_activity': recent_activity_feed(include_payments=False, limit=8),
        })


class SupportDashboardView(APIView):
    permission_classes = [IsAdminOrSupportStaff]

    def get(self, request):
        today = timezone.now().date()
        tickets = SupportTicket.objects.all()
        resolved = tickets.filter(resolved_at__isnull=False).annotate(
            response_time=ExpressionWrapper(F('resolved_at') - F('created_at'), output_field=DurationField())
        )
        avg_response = resolved.aggregate(avg=Avg('response_time'))['avg']
        avg_hours = round(avg_response.total_seconds() / 3600, 1) if avg_response else None

        return Response({
            'user': user_summary(request.user),
            'statistics': {
                'open_tickets': tickets.filter(status=SupportTicket.Status.OPEN).count(),
                'in_progress': tickets.filter(status=SupportTicket.Status.IN_PROGRESS).count(),
                'high_priority': tickets.filter(priority__in=['high', 'urgent']).exclude(
                    status__in=['resolved', 'closed']
                ).count(),
                'resolved_today': tickets.filter(resolved_at__date=today).count(),
                'average_response_time_hours': avg_hours,
            },
            'tickets': list(
                tickets.select_related('user', 'assigned_to').order_by('-created_at').values(
                    'id', 'subject', 'user__first_name', 'user__last_name', 'category', 'priority',
                    'assigned_to__first_name', 'assigned_to__last_name', 'status', 'created_at', 'resolved_at',
                )[:15]
            ),
        })
