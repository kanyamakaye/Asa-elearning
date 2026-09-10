"""Who's allowed to message whom — reuses the platform's existing
enrollment/course relationships instead of a separate messaging permission
system (Messages spec §4/§17).

Rules:
  Student    -> instructors of courses they're enrolled in, plus admin/support.
  Instructor -> students enrolled in courses they teach, plus admin/support.
  Admin/staff -> everyone (students and instructors).
"""

from django.contrib.auth import get_user_model
from django.db.models import Q

from courses.models import Course, CourseInstructor
from enrollments.models import Enrollment

User = get_user_model()

STAFF_TYPES = ('admin', 'academic_manager', 'content_manager', 'support_staff')


def is_staff_role(user):
    return user.is_staff or user.user_type in STAFF_TYPES


def get_allowed_contacts(user):
    """Queryset of users `user` may start a *new* conversation with."""
    if is_staff_role(user):
        return User.objects.exclude(pk=user.pk).filter(
            Q(user_type__in=('student', 'instructor')) | Q(user_type__in=STAFF_TYPES) | Q(is_staff=True),
        ).distinct()

    if user.user_type == 'student':
        course_ids = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
        instructor_ids = set(Course.objects.filter(id__in=course_ids).values_list('instructor_id', flat=True))
        instructor_ids |= set(
            CourseInstructor.objects.filter(course_id__in=course_ids).values_list('instructor_id', flat=True),
        )
        return User.objects.filter(
            Q(pk__in=instructor_ids) | Q(user_type__in=STAFF_TYPES) | Q(is_staff=True),
        ).exclude(pk=user.pk).distinct()

    if user.user_type == 'instructor':
        course_ids = list(Course.objects.filter(instructor=user).values_list('id', flat=True))
        course_ids += list(CourseInstructor.objects.filter(instructor=user).values_list('course_id', flat=True))
        student_ids = Enrollment.objects.filter(course_id__in=course_ids).values_list('student_id', flat=True)
        return User.objects.filter(
            Q(pk__in=student_ids) | Q(user_type__in=STAFF_TYPES) | Q(is_staff=True),
        ).exclude(pk=user.pk).distinct()

    # Any other role reaching here (shouldn't normally happen) — staff-only.
    return User.objects.filter(Q(user_type__in=STAFF_TYPES) | Q(is_staff=True)).exclude(pk=user.pk)


def can_message(user, other):
    if user.pk == other.pk:
        return False
    return get_allowed_contacts(user).filter(pk=other.pk).exists()
