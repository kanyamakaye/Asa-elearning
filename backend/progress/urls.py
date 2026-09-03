from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('', views.LessonProgressViewSet, basename='lesson-progress')

urlpatterns = [
    path('', include(router.urls)),
]
