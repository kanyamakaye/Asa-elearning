"""Rule-based badge awarding — badges are never manually assigned, they're
granted automatically the moment a student crosses one of these thresholds.
Called from wherever the underlying event actually happens (course
completion, certificate issuance, a graded quiz attempt) rather than on a
schedule, since this platform has no background job runner."""
from certificates.models import Badge, UserBadge
from enrollments.models import Enrollment


def _award(student, trigger, course=None):
    badge = Badge.objects.filter(trigger=trigger).first()
    if not badge:
        return None
    obj, created = UserBadge.objects.get_or_create(user=student, badge=badge, course=course)
    return obj if created else None


def check_completion_badges(student, course):
    completed_count = Enrollment.objects.filter(student=student, status=Enrollment.Status.COMPLETED).count()
    if completed_count >= 1:
        _award(student, Badge.Trigger.COURSE_COMPLETED, course=course)
    if completed_count == 1:
        _award(student, Badge.Trigger.FIRST_COURSE_COMPLETED, course=course)
    if completed_count >= 5:
        _award(student, Badge.Trigger.FIVE_COURSES_COMPLETED)


def check_certificate_badge(student, course):
    _award(student, Badge.Trigger.CERTIFICATE_EARNED, course=course)


def check_quiz_score_badge(student, course, percentage):
    if percentage and percentage >= 100:
        _award(student, Badge.Trigger.PERFECT_QUIZ_SCORE, course=course)
