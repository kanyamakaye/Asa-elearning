from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('wishlist', views.WishlistViewSet, basename='wishlist')
router.register('', views.CourseReviewViewSet, basename='course-review')

urlpatterns = [
    path('', include(router.urls)),
]
