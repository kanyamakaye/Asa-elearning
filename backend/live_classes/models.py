from django.conf import settings
from django.db import models


class LiveSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        LIVE = 'live', 'Live'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        POSTPONED = 'postponed', 'Postponed'

    class Platform(models.TextChoices):
        ZOOM = 'zoom', 'Zoom'
        GOOGLE_MEET = 'google_meet', 'Google Meet'
        TEAMS = 'teams', 'Microsoft Teams'
        OTHER = 'other', 'Other'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='live_sessions')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='live_sessions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    meeting_platform = models.CharField(max_length=20, choices=Platform.choices, default=Platform.ZOOM)
    meeting_url = models.URLField(blank=True)
    meeting_id = models.CharField(max_length=100, blank=True)
    meeting_password = models.CharField(max_length=100, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    timezone = models.CharField(max_length=64, default='UTC')
    capacity = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    recording_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_date', '-start_time']

    def __str__(self):
        return self.title


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'
        LATE = 'late', 'Late'
        EXCUSED = 'excused', 'Excused'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField(auto_now_add=True)
    attendance_status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    check_in_time = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_recorded'
    )

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f'{self.student} - {self.session} ({self.attendance_status})'
