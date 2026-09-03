from django.conf import settings
from django.db import models


class LessonProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey('lessons.Lesson', on_delete=models.CASCADE, related_name='progress_records')
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('student', 'lesson')
        verbose_name_plural = 'Lesson progress records'

    def __str__(self):
        return f'{self.student} - {self.lesson} ({self.progress_percentage}%)'
