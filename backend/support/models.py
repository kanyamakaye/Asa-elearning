from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class SupportTicket(models.Model):
    class Category(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        ACADEMIC = 'academic', 'Academic'
        PAYMENT = 'payment', 'Payment'
        ACCOUNT = 'account', 'Account'
        GENERAL = 'general', 'General'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'#{self.pk} {self.subject}'


class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.question


class Feedback(models.Model):
    class FeedbackType(models.TextChoices):
        SUGGESTION = 'suggestion', 'Suggestion'
        COMPLAINT = 'complaint', 'Complaint'
        APPRECIATION = 'appreciation', 'Appreciation'
        TECHNICAL = 'technical', 'Technical Issue'

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        REVIEWED = 'reviewed', 'Reviewed'
        CLOSED = 'closed', 'Closed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedback_submissions')
    feedback_type = models.CharField(max_length=20, choices=FeedbackType.choices, default=FeedbackType.SUGGESTION)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.feedback_type}: {self.subject}'
