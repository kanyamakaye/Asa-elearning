"""Centralized course-content authorization (Group.md — Student Group and
Course Access Management).

`can_access_course` is the single source of truth for "may this user view
or participate in this course's content" and must be used by every
protected course/lesson/assessment/progress endpoint instead of each view
re-implementing its own enrollment check.

Access rules, in order:
1. Staff / admin / academic manager / content manager — always.
2. The course's owning or co-instructor — always.
3. A normal enrollment (Enrollment row exists) — unchanged, pre-existing
   behavior for every course, grouped or not.
4. Membership in a student group the course is assigned to (Group.md) —
   an independent, additional path to access, not a replacement for
   enrollment. A course with no group assigned is completely unaffected
   by this rule (existing enrollment-only behavior is preserved exactly).

Group membership does not create an Enrollment row (no auto-enrollment):
a group-only member can view lessons and participate in assessments, but
progress/completion rollup and certificate issuance — which are keyed off
Enrollment — only apply once the student is also enrolled.
"""
from enrollments.models import Enrollment

from .models import CourseInstructor

MANAGER_USER_TYPES = ('admin', 'academic_manager', 'content_manager')


def can_access_course(user, course):
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.user_type in MANAGER_USER_TYPES:
        return True
    if course.instructor_id == user.id:
        return True
    if CourseInstructor.objects.filter(course=course, instructor=user).exists():
        return True
    if Enrollment.objects.filter(student=user, course=course).exists():
        return True
    # Local import: groups depends on courses (via a lazy 'courses.Course'
    # string FK), so importing groups.models at module scope here would risk
    # a circular import if that ever changes to a direct import.
    from groups.models import StudentGroupMembership
    return StudentGroupMembership.objects.filter(student=user, group__courses=course).exists()
