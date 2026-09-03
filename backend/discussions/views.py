from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from .models import DiscussionReply, DiscussionTopic
from .serializers import DiscussionReplySerializer, DiscussionTopicDetailSerializer, DiscussionTopicSerializer


class DiscussionTopicViewSet(viewsets.ModelViewSet):
    queryset = DiscussionTopic.objects.select_related('created_by').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['title', 'description']

    def get_serializer_class(self):
        return DiscussionTopicDetailSerializer if self.action == 'retrieve' else DiscussionTopicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        return qs.filter(course_id=course_id) if course_id else qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DiscussionReplyViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = DiscussionReply.objects.select_related('user')
        topic_id = self.request.query_params.get('topic')
        return qs.filter(topic_id=topic_id) if topic_id else qs

    def perform_create(self, serializer):
        topic = serializer.validated_data['topic']
        if topic.is_locked:
            raise ValidationError('This discussion topic is locked.')
        serializer.save(user=self.request.user)
