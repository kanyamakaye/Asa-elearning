from django.conf import settings
from django.db import models


class DiscussionTopic(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        CLOSED = 'closed', 'Closed'
        HIDDEN = 'hidden', 'Hidden'

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='discussion_topics')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='discussion_topics')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title


class DiscussionReply(models.Model):
    topic = models.ForeignKey(DiscussionTopic, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='discussion_replies')
    reply_text = models.TextField()
    parent_reply = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='child_replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Reply by {self.user} on {self.topic}'
