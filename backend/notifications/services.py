"""Small helper around the existing Notification model so the course/quiz/
assignment/live-class features can raise in-app notifications without
building a second notification system (see course.md #50)."""

from .models import Notification


def notify_users(users, *, notification_type, title, message, reference_type='', reference_id=None):
    """Bulk-create one Notification per user. ``users`` may be any iterable
    of User instances or a queryset."""
    notifications = [
        Notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        for user in users
    ]
    if notifications:
        Notification.objects.bulk_create(notifications)
    return len(notifications)


def notify_enrolled_students(course, *, notification_type, title, message, reference_type='', reference_id=None):
    from accounts.models import User
    from enrollments.models import Enrollment

    student_ids = Enrollment.objects.filter(
        course=course, status__in=[Enrollment.Status.ACTIVE, Enrollment.Status.PENDING]
    ).values_list('student_id', flat=True)
    users = User.objects.filter(id__in=student_ids)
    return notify_users(
        users,
        notification_type=notification_type,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id,
    )
