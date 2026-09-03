from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CourseReview(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPROVED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'student')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} rated {self.course} - {self.rating}/5'


class Wishlist(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} wishlisted {self.course}'
