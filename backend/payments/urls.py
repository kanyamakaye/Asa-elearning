from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('refunds', views.RefundViewSet, basename='refund')
router.register('', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
