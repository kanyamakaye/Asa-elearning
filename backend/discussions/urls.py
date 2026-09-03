from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('replies', views.DiscussionReplyViewSet, basename='discussion-reply')
router.register('', views.DiscussionTopicViewSet, basename='discussion-topic')

urlpatterns = [
    path('', include(router.urls)),
]
