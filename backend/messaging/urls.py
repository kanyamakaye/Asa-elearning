from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('conversations', views.ConversationViewSet, basename='conversation')

urlpatterns = [
    path('unread-count/', views.UnreadMessageCountView.as_view(), name='messages-unread-count'),
    path('contacts/', views.ContactsView.as_view(), name='messages-contacts'),
    path('conversations/<int:conversation_id>/messages/', views.ConversationMessagesView.as_view(), name='conversation-messages'),
    path('conversations/<int:conversation_id>/read/', views.MarkConversationReadView.as_view(), name='conversation-read'),
    path('', include(router.urls)),
]
