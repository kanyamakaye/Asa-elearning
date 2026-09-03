from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('', views.CertificateViewSet, basename='certificate')

urlpatterns = [
    path('verify/', views.VerifyCertificateView.as_view(), name='certificate-verify'),
    path('', include(router.urls)),
]
