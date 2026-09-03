import uuid

from django.conf import settings
from django.db import models


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

    def __str__(self):
        return f'{self.certificate_number} - {self.student}'
