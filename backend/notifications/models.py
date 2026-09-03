from django.conf import settings
from django.db import models


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    message = models.TextField()
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} -> {self.user}'


class Announcement(models.Model):
    class Audience(models.TextChoices):
        STUDENTS = 'students', 'Students'
        INSTRUCTORS = 'instructors', 'Instructors'
        ALL = 'all', 'All Users'
        COURSE = 'course', 'Specific Course'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    course = models.ForeignKey(
        'courses.Course', on_delete=models.CASCADE, null=True, blank=True, related_name='announcements'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='announcements_created'
    )
    audience_type = models.CharField(max_length=20, choices=Audience.choices, default=Audience.ALL)
    publish_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
