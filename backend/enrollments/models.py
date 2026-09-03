from django.conf import settings
from django.db import models


class Enrollment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        SUSPENDED = 'suspended', 'Suspended'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    final_grade = models.CharField(max_length=10, blank=True)
    certificate_issued = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} in {self.course} ({self.status})'
