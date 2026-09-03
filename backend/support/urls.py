from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('tickets', views.SupportTicketViewSet, basename='support-ticket')
router.register('faqs', views.FAQViewSet, basename='faq')
router.register('feedback', views.FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]
