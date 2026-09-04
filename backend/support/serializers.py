from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import FAQ, Feedback, SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    assigned_to = UserPublicSerializer(read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'subject', 'description', 'category', 'priority', 'status',
            'assigned_to', 'created_at', 'resolved_at',
        ]
        read_only_fields = ['id', 'user', 'assigned_to', 'created_at', 'resolved_at']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'display_order', 'is_active']
        read_only_fields = ['id']


class FeedbackSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'feedback_type', 'subject', 'message', 'rating', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']
