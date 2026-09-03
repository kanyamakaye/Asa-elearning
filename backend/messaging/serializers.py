from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    receiver_detail = UserPublicSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'receiver', 'receiver_detail', 'subject', 'message_body', 'attachment',
            'is_read', 'read_at', 'sent_at',
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'sent_at']
