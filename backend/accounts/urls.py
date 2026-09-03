from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('auth/verify-email/', views.EmailVerificationConfirmView.as_view(), name='auth-verify-email'),

    path('users/me/', views.MeView.as_view(), name='user-me'),
    path('users/me/student-profile/', views.MyStudentProfileView.as_view(), name='user-me-student-profile'),
    path('users/me/instructor-profile/', views.MyInstructorProfileView.as_view(), name='user-me-instructor-profile'),

    path('', include(router.urls)),
]
