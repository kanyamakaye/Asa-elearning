from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Conversation, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'created_at']
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    """List/detail representation — summarizes the *other* participant(s),
    the last message, and this user's unread count, so the conversation
    list can render without a second round-trip per row."""

    other_participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_participants', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def _request_user(self):
        return self.context['request'].user

    def get_other_participants(self, obj):
        user = self._request_user()
        others = [p.user for p in obj.participants.all() if p.user_id != user.id]
        return UserPublicSerializer(others, many=True).data

    def get_last_message(self, obj):
        messages = list(obj.messages.all())
        if not messages:
            return None
        last = messages[-1]
        return {'content': last.content, 'created_at': last.created_at, 'sender_id': last.sender_id}

    def get_unread_count(self, obj):
        user = self._request_user()
        participant = next((p for p in obj.participants.all() if p.user_id == user.id), None)
        messages = [m for m in obj.messages.all() if m.sender_id != user.id]
        if participant and participant.last_read_at:
            messages = [m for m in messages if m.created_at > participant.last_read_at]
        return len(messages)


class StartConversationSerializer(serializers.Serializer):
    recipient = serializers.IntegerField()
    message = serializers.CharField()

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value.strip()


class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'username', 'user_type', 'profile_picture']
