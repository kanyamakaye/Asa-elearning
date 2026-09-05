from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('categories', views.CourseCategoryViewSet, basename='course-category')
router.register('units', views.CourseUnitViewSet, basename='course-unit')
router.register('modules', views.CourseModuleViewSet, basename='course-module')
router.register('course-instructors', views.CourseInstructorViewSet, basename='course-instructor')
router.register('', views.CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]
