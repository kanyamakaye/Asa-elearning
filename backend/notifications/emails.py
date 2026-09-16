"""Reminder emails — same branded template and send mechanism as
accounts/emails.py (templates/emails/base.html via the configured
EMAIL_BACKEND), just for the reminder categories in notifications/reminders.py
instead of authentication events.
"""

from django.conf import settings

from accounts.emails import PLATFORM_NAME, _send

FRONTEND_URL = settings.FRONTEND_URL.rstrip('/')


def send_live_class_reminder_email(user, session):
    _send(
        user.email,
        f'{PLATFORM_NAME} — "{session.title}" starts soon',
        heading='Your live class is starting soon',
        intro_lines=[
            f'Hello {user.first_name},',
            f'"{session.title}" ({session.course.title}) is scheduled for '
            f'{session.scheduled_date} at {session.start_time} ({session.timezone}). '
            'Make sure you’re ready to join on time.',
        ],
        cta_url=session.meeting_url or f'{FRONTEND_URL}/dashboard/live-classes',
        cta_label='Join Live Class' if session.meeting_url else 'View Live Classes',
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_assignment_due_reminder_email(user, assignment):
    _send(
        user.email,
        f'{PLATFORM_NAME} — "{assignment.title}" is due soon',
        heading='An assignment is due soon',
        intro_lines=[
            f'Hello {user.first_name},',
            f'"{assignment.title}" in {assignment.course.title} is due on '
            f'{assignment.due_date:%B %d, %Y at %H:%M} UTC. Submit it before the deadline to avoid '
            'losing marks.',
        ],
        cta_url=f'{FRONTEND_URL}/learn/{assignment.course.slug}',
        cta_label='Go to Course',
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_quiz_due_reminder_email(user, quiz):
    _send(
        user.email,
        f'{PLATFORM_NAME} — "{quiz.title}" closes soon',
        heading='A quiz closes soon',
        intro_lines=[
            f'Hello {user.first_name},',
            f'"{quiz.title}" in {quiz.course.title} closes on '
            f'{quiz.available_until:%B %d, %Y at %H:%M} UTC. Take it before then if you haven’t already.',
        ],
        cta_url=f'{FRONTEND_URL}/learn/{quiz.course.slug}',
        cta_label='Go to Course',
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_exam_due_reminder_email(user, exam):
    _send(
        user.email,
        f'{PLATFORM_NAME} — "{exam.title}" is coming up',
        heading='An exam is coming up',
        intro_lines=[
            f'Hello {user.first_name},',
            f'"{exam.title}" in {exam.course.title} is scheduled for '
            f'{exam.exam_date} at {exam.start_time}. Make sure you’re prepared.',
        ],
        cta_url=f'{FRONTEND_URL}/dashboard/assessments',
        cta_label='View Assessments',
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_course_inactivity_reminder_email(user, course, days_inactive):
    _send(
        user.email,
        f'{PLATFORM_NAME} — Pick up where you left off in {course.title}',
        heading='We miss you!',
        intro_lines=[
            f'Hello {user.first_name},',
            f'It’s been {days_inactive} days since you made progress in "{course.title}". '
            'Jump back in whenever you’re ready — your progress is saved.',
        ],
        cta_url=f'{FRONTEND_URL}/learn/{course.slug}',
        cta_label='Continue Learning',
        signoff_team=f'{PLATFORM_NAME} Team',
    )


def send_payment_reminder_email(user, payment):
    is_failed = payment.payment_status == payment.Status.FAILED
    _send(
        user.email,
        f'{PLATFORM_NAME} — {"Payment failed" if is_failed else "Payment pending"} for {payment.course.title}',
        heading='Payment failed, please retry' if is_failed else 'Complete your payment',
        intro_lines=[
            f'Hello {user.first_name},',
            (
                f'Your payment of {payment.amount} {payment.currency} for "{payment.course.title}" '
                f'{"could not be processed" if is_failed else "is still pending"}. '
                'Complete it to keep your access to this course.'
            ),
        ],
        cta_url=f'{FRONTEND_URL}/dashboard/payments',
        cta_label='View Payment',
        signoff_team=f'{PLATFORM_NAME} Team',
    )
