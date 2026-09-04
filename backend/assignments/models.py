from django.conf import settings
from django.db import models


class Assignment(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CLOSED = 'closed', 'Closed'

    class SubmissionType(models.TextChoices):
        FILE = 'file', 'File'
        TEXT = 'text', 'Text'
        FILE_AND_TEXT = 'file_and_text', 'File and Text'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    module = models.ForeignKey(
        'courses.CourseModule', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments'
    )
    lesson = models.ForeignKey(
        'lessons.Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    maximum_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=50)
    due_date = models.DateTimeField(null=True, blank=True)
    submission_type = models.CharField(max_length=20, choices=SubmissionType.choices, default=SubmissionType.FILE_AND_TEXT)
    allowed_file_types = models.JSONField(default=list, blank=True)
    max_file_size = models.PositiveIntegerField(null=True, blank=True, help_text='Maximum file size in KB.')
    allow_late_submission = models.BooleanField(default=False)
    late_penalty = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Percentage deducted per late submission.')
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assignments_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        LATE = 'late', 'Late'
        GRADED = 'graded', 'Graded'
        RETURNED = 'returned', 'Returned'
        RESUBMITTED = 'resubmitted', 'Resubmitted'

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_text = models.TextField(blank=True)
    file = models.FileField(upload_to='submissions/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    marks_awarded = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions'
    )
    graded_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)

    class Meta:
        unique_together = ('assignment', 'student')
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.student} - {self.assignment}'
