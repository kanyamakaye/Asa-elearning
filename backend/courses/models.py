import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class CourseCategory(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Course categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Course(models.Model):
    class Level(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
        SUSPENDED = 'suspended', 'Suspended'

    course_code = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    category = models.ForeignKey(
        CourseCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses'
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_taught'
    )
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    language = models.CharField(max_length=50, default='English')
    duration_hours = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    video_url = models.URLField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_free = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    enrollment_limit = models.PositiveIntegerField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    certificate_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.course_code:
            self.course_code = f'CRS-{uuid.uuid4().hex[:8].upper()}'
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            i = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f'{base_slug}-{i}'
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class CourseInstructor(models.Model):
    class Role(models.TextChoices):
        LEAD = 'lead', 'Lead Instructor'
        ASSISTANT = 'assistant', 'Assistant Instructor'
        TUTOR = 'tutor', 'Tutor'
        MODERATOR = 'moderator', 'Moderator'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_instructors')
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='co_instructing'
    )
    instructor_role = models.CharField(max_length=20, choices=Role.choices, default=Role.ASSISTANT)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'instructor')

    def __str__(self):
        return f'{self.instructor} on {self.course} ({self.instructor_role})'


class CourseModule(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        HIDDEN = 'hidden', 'Hidden'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.course} - {self.title}'
