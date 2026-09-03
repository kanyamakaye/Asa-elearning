from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('attendance', views.AttendanceViewSet, basename='attendance')
router.register('', views.LiveSessionViewSet, basename='live-session')

urlpatterns = [
    path('', include(router.urls)),
]
