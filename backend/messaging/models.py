from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """A message thread between two or more users — see messaging.authorization
    for who may start one, and MessageViewSet for the one-to-one dedup rule
    (an existing conversation between the same two users is reused rather
    than creating a duplicate)."""

    created_at = models.DateTimeField(auto_now_add=True)
    # Bumped on every new message so conversation lists can sort "most
    # recently active first" with a single ORDER BY.
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Conversation #{self.pk}'


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversation_participations',
    )
    # Null means "never opened this conversation" — every message in it is
    # unread. Updated whenever the user reads the conversation.
    last_read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f'{self.user} in conversation #{self.conversation_id}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    # blank=False is enforced at the API layer (ConversationMessagesView);
    # default='' here only exists so the migration adding this field to the
    # old table doesn't need an interactive prompt for a backfill value.
    content = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender} @ {self.created_at}: {self.content[:30]}'
