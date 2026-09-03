from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import DiscussionReply, DiscussionTopic


class DiscussionReplySerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = DiscussionReply
        fields = ['id', 'topic', 'user', 'reply_text', 'parent_reply', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class DiscussionTopicSerializer(serializers.ModelSerializer):
    created_by = UserPublicSerializer(read_only=True)
    reply_count = serializers.IntegerField(source='replies.count', read_only=True)

    class Meta:
        model = DiscussionTopic
        fields = [
            'id', 'course', 'created_by', 'title', 'description', 'is_pinned', 'is_locked',
            'status', 'reply_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class DiscussionTopicDetailSerializer(DiscussionTopicSerializer):
    replies = DiscussionReplySerializer(many=True, read_only=True)

    class Meta(DiscussionTopicSerializer.Meta):
        fields = DiscussionTopicSerializer.Meta.fields + ['replies']
