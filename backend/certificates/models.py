import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Certificate(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        REVOKED = 'revoked', 'Revoked'
        EXPIRED = 'expired', 'Expired'

    certificate_number = models.CharField(max_length=40, unique=True, blank=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='certificates')
    enrollment = models.ForeignKey(
        'enrollments.Enrollment', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates'
    )
    issue_date = models.DateField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)
    renewed_at = models.DateTimeField(null=True, blank=True)
    renewal_count = models.PositiveIntegerField(default=0)
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)
    verification_code = models.CharField(max_length=40, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f'ASA-CERT-{uuid.uuid4().hex[:10].upper()}'
        if not self.verification_code:
            self.verification_code = uuid.uuid4().hex[:16].upper()
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return bool(self.expires_at and self.expires_at < timezone.localdate())

    def __str__(self):
        return f'{self.certificate_number} - {self.student}'


class Badge(models.Model):
    """A recognizable achievement a student can earn — awarded automatically
    by rule (see progress.badges), not manually assigned."""

    class Trigger(models.TextChoices):
        FIRST_COURSE_COMPLETED = 'first_course_completed', 'Completed First Course'
        COURSE_COMPLETED = 'course_completed', 'Completed a Course'
        PERFECT_QUIZ_SCORE = 'perfect_quiz_score', 'Perfect Quiz Score'
        FIVE_COURSES_COMPLETED = 'five_courses_completed', 'Completed 5 Courses'
        CERTIFICATE_EARNED = 'certificate_earned', 'Certificate Earned'

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='🏆', help_text='A single emoji used as the badge icon.')
    trigger = models.CharField(max_length=30, choices=Trigger.choices, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    course = models.ForeignKey(
        'courses.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
        help_text='The course that triggered this award, if applicable.',
    )
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge', 'course')
        ordering = ['-awarded_at']

    def __str__(self):
        return f'{self.badge} -> {self.user}'
