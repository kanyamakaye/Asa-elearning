from django.conf import settings
from django.db import models


class Lesson(models.Model):
    class LessonType(models.TextChoices):
        VIDEO = 'video', 'Video'
        TEXT = 'text', 'Text'
        AUDIO = 'audio', 'Audio'
        PDF = 'pdf', 'PDF'
        PRESENTATION = 'presentation', 'Presentation'
        LIVE_SESSION = 'live_session', 'Live Session'
        EXTERNAL_LINK = 'external_link', 'External Link'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        HIDDEN = 'hidden', 'Hidden'

    module = models.ForeignKey('courses.CourseModule', on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=20, choices=LessonType.choices, default=LessonType.VIDEO)
    content = models.TextField(blank=True)
    content_url = models.URLField(blank=True)
    video_url = models.URLField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    @property
    def course(self):
        return self.module.course

    def __str__(self):
        return f'{self.module} - {self.title}'


class LearningResource(models.Model):
    class ResourceType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        DOCUMENT = 'document', 'Document'
        PRESENTATION = 'presentation', 'Presentation'
        VIDEO = 'video', 'Video'
        AUDIO = 'audio', 'Audio'
        IMAGE = 'image', 'Image'
        LINK = 'link', 'Link'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='resources')
    lesson = models.ForeignKey(
        Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources'
    )
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices, default=ResourceType.DOCUMENT)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    file_url = models.URLField(blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True)
    is_downloadable = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_resources'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
