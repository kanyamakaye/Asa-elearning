from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('resources', views.LearningResourceViewSet, basename='learning-resource')
router.register('', views.LessonViewSet, basename='lesson')

urlpatterns = [
    path('', include(router.urls)),
]
