"""Reminder scans for send_reminders (see the management command of the same
name). Each remind_* function finds things that are due/starting/stale soon,
skips anything it already reminded a user about within its cooldown window
(so this is safe to run on a schedule — cron, Windows Task Scheduler, a
hosting platform's scheduled job — without spamming duplicates), then raises
an in-app Notification and sends the matching branded email.

Nothing here is wired to a scheduler itself (this project has no Celery/
cron runner) — something external is expected to call
`manage.py send_reminders` periodically, e.g. once an hour.
"""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.db.models import Max
from django.utils import timezone

from accounts.models import User
from assessments.models import Exam, Quiz
from assignments.models import Assignment, AssignmentSubmission
from enrollments.models import Enrollment
from live_classes.models import LiveSession
from payments.models import Payment
from progress.models import LessonProgress

from . import emails
from .models import Notification


def _enrolled_students(course_id):
    student_ids = Enrollment.objects.filter(
        course_id=course_id, status__in=[Enrollment.Status.ACTIVE, Enrollment.Status.PENDING]
    ).values_list('student_id', flat=True)
    return User.objects.filter(id__in=student_ids)


def _remind(user, *, notification_type, title, message, reference_type, reference_id, cooldown, email_fn):
    """Creates the Notification + sends the email, unless the same
    (user, type, reference) combination was already reminded within
    `cooldown` — returns whether a reminder was actually sent."""
    since = timezone.now() - cooldown
    already_sent = Notification.objects.filter(
        user=user,
        notification_type=notification_type,
        reference_type=reference_type,
        reference_id=reference_id,
        created_at__gte=since,
    ).exists()
    if already_sent:
        return False

    Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    email_fn(user)
    return True


def remind_upcoming_live_classes(hours_ahead=24):
    """Live sessions starting within `hours_ahead` hours, for every actively
    enrolled student. Cooldown = the same window, so each session only
    reminds once (it can't start twice)."""
    now = timezone.now()
    window_end = now + timedelta(hours=hours_ahead)
    sent = 0

    sessions = LiveSession.objects.filter(
        status=LiveSession.Status.SCHEDULED,
        scheduled_date__isnull=False,
        start_time__isnull=False,
        scheduled_date__lte=window_end.date(),
    ).select_related('course')

    for session in sessions:
        try:
            tz = ZoneInfo(session.timezone or 'UTC')
        except ZoneInfoNotFoundError:
            tz = ZoneInfo('UTC')
        starts_at = datetime.combine(session.scheduled_date, session.start_time, tzinfo=tz)
        if not (now <= starts_at <= window_end):
            continue

        for student in _enrolled_students(session.course_id):
            sent += _remind(
                student,
                notification_type='live_class_reminder',
                title=f'"{session.title}" starts soon',
                message=f'{session.course.title}: {session.title} starts on '
                        f'{session.scheduled_date} at {session.start_time} ({session.timezone}).',
                reference_type='live_session',
                reference_id=session.id,
                cooldown=timedelta(hours=hours_ahead),
                email_fn=lambda u, s=session: emails.send_live_class_reminder_email(u, s),
            )
    return sent


def remind_due_assignments(hours_ahead=48):
    """Published assignments due within `hours_ahead` hours, for enrolled
    students who haven't submitted yet."""
    now = timezone.now()
    window_end = now + timedelta(hours=hours_ahead)
    sent = 0

    assignments = Assignment.objects.filter(
        status=Assignment.Status.PUBLISHED, due_date__gte=now, due_date__lte=window_end,
    ).select_related('course')

    for assignment in assignments:
        submitted_student_ids = set(
            AssignmentSubmission.objects.filter(assignment=assignment).values_list('student_id', flat=True)
        )
        for student in _enrolled_students(assignment.course_id):
            if student.id in submitted_student_ids:
                continue
            sent += _remind(
                student,
                notification_type='assignment_due_reminder',
                title=f'"{assignment.title}" is due soon',
                message=f'{assignment.course.title}: {assignment.title} is due on '
                        f'{assignment.due_date:%Y-%m-%d %H:%M} UTC.',
                reference_type='assignment',
                reference_id=assignment.id,
                cooldown=timedelta(hours=hours_ahead),
                email_fn=lambda u, a=assignment: emails.send_assignment_due_reminder_email(u, a),
            )
    return sent


def remind_due_quizzes(hours_ahead=48):
    """Published quizzes closing within `hours_ahead` hours, for enrolled
    students who haven't attempted them yet."""
    now = timezone.now()
    window_end = now + timedelta(hours=hours_ahead)
    sent = 0

    quizzes = Quiz.objects.filter(
        status=Quiz.Status.PUBLISHED, available_until__gte=now, available_until__lte=window_end,
    ).select_related('course')

    for quiz in quizzes:
        attempted_student_ids = set(quiz.attempts.values_list('student_id', flat=True))
        for student in _enrolled_students(quiz.course_id):
            if student.id in attempted_student_ids:
                continue
            sent += _remind(
                student,
                notification_type='quiz_due_reminder',
                title=f'"{quiz.title}" closes soon',
                message=f'{quiz.course.title}: {quiz.title} closes on '
                        f'{quiz.available_until:%Y-%m-%d %H:%M} UTC.',
                reference_type='quiz',
                reference_id=quiz.id,
                cooldown=timedelta(hours=hours_ahead),
                email_fn=lambda u, q=quiz: emails.send_quiz_due_reminder_email(u, q),
            )
    return sent


def remind_due_exams(hours_ahead=48):
    """Scheduled exams within `hours_ahead` hours, for every enrolled
    student (exams aren't opt-out the way an assignment submission is)."""
    now = timezone.now()
    window_end = now + timedelta(hours=hours_ahead)
    sent = 0

    exams = Exam.objects.filter(
        status=Exam.Status.SCHEDULED, exam_date__isnull=False, start_time__isnull=False,
        exam_date__lte=window_end.date(),
    ).select_related('course')

    for exam in exams:
        starts_at = datetime.combine(exam.exam_date, exam.start_time, tzinfo=ZoneInfo('UTC'))
        if not (now <= starts_at <= window_end):
            continue
        for student in _enrolled_students(exam.course_id):
            sent += _remind(
                student,
                notification_type='exam_due_reminder',
                title=f'"{exam.title}" is coming up',
                message=f'{exam.course.title}: {exam.title} is scheduled for '
                        f'{exam.exam_date} at {exam.start_time}.',
                reference_type='exam',
                reference_id=exam.id,
                cooldown=timedelta(hours=hours_ahead),
                email_fn=lambda u, e=exam: emails.send_exam_due_reminder_email(u, e),
            )
    return sent


def remind_inactive_enrollments(inactive_days=14):
    """Active, incomplete enrollments with no lesson activity in
    `inactive_days` days. Cooldown matches the window so a still-inactive
    student is nudged again roughly every `inactive_days` days rather than
    on every run."""
    now = timezone.now()
    cutoff = now - timedelta(days=inactive_days)
    sent = 0

    enrollments = Enrollment.objects.filter(
        status=Enrollment.Status.ACTIVE, completion_percentage__lt=100,
    ).select_related('student', 'course')

    # (student_id, course_id) -> last_accessed_at, computed once up front
    # instead of per-enrollment to avoid one query per row.
    last_activity_by_key = {}
    for row in LessonProgress.objects.values('student_id', 'course_id').annotate(last_activity=Max('last_accessed_at')):
        last_activity_by_key[(row['student_id'], row['course_id'])] = row['last_activity']

    for enrollment in enrollments:
        last_activity = last_activity_by_key.get((enrollment.student_id, enrollment.course_id)) or enrollment.updated_at
        if last_activity >= cutoff:
            continue
        days_inactive = (now - last_activity).days
        sent += _remind(
            enrollment.student,
            notification_type='course_inactivity_reminder',
            title=f'Pick up where you left off in {enrollment.course.title}',
            message=f'You haven’t made progress in {enrollment.course.title} in {days_inactive} days.',
            reference_type='enrollment',
            reference_id=enrollment.id,
            cooldown=timedelta(days=inactive_days),
            email_fn=lambda u, c=enrollment.course, d=days_inactive: emails.send_course_inactivity_reminder_email(u, c, d),
        )
    return sent


def remind_unresolved_payments(min_age_hours=24, cooldown_days=7):
    """Pending or failed payments older than `min_age_hours`, reminded at
    most once every `cooldown_days` per payment."""
    now = timezone.now()
    cutoff = now - timedelta(hours=min_age_hours)
    sent = 0

    payments = Payment.objects.filter(
        payment_status__in=[Payment.Status.PENDING, Payment.Status.FAILED], created_at__lte=cutoff,
    ).select_related('student', 'course')

    for payment in payments:
        sent += _remind(
            payment.student,
            notification_type='payment_reminder',
            title=f'{"Payment failed" if payment.payment_status == Payment.Status.FAILED else "Payment pending"} for {payment.course.title}',
            message=f'Your payment of {payment.amount} {payment.currency} for {payment.course.title} '
                    f'is still {payment.payment_status}.',
            reference_type='payment',
            reference_id=payment.id,
            cooldown=timedelta(days=cooldown_days),
            email_fn=lambda u, p=payment: emails.send_payment_reminder_email(u, p),
        )
    return sent


def run_all_reminders():
    """Runs every reminder scan and returns a dict of category -> count sent."""
    return {
        'live_classes': remind_upcoming_live_classes(),
        'assignments': remind_due_assignments(),
        'quizzes': remind_due_quizzes(),
        'exams': remind_due_exams(),
        'inactivity': remind_inactive_enrollments(),
        'payments': remind_unresolved_payments(),
    }
