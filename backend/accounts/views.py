import uuid

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import EmailVerificationToken, InstructorProfile, LoginHistory, PasswordResetToken, StudentProfile
from .permissions import IsAdmin
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    EmailVerificationConfirmSerializer,
    InstructorProfileSerializer,
    InstructorPublicSerializer,
    LoginHistorySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    StudentProfileSerializer,
    UserPublicSerializer,
    UserSerializer,
)

User = get_user_model()


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0] if forwarded else request.META.get('REMOTE_ADDR')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        verification = EmailVerificationToken.objects.create(
            user=user,
            token=uuid.uuid4().hex,
            expires_at=timezone.now() + timedelta(days=2),
        )
        send_mail(
            'Verify your Asa Academy account',
            f'Welcome to Asa Academy! Your verification code is: {verification.token}',
            None,
            [user.email],
            fail_silently=True,
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            email = request.data.get('email') or request.data.get(User.USERNAME_FIELD)
            user = User.objects.filter(email=email).first()
            LoginHistory.objects.create(
                user=user,
                ip_address=client_ip(request),
                device_information=request.META.get('HTTP_USER_AGENT', '')[:255],
                login_status=LoginHistory.LoginStatus.SUCCESSFUL,
            )
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class MyStudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class MyInstructorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = InstructorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = InstructorProfile.objects.get_or_create(user=self.request.user)
        return profile


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated successfully.'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data['email']).first()
        if user:
            reset = PasswordResetToken.objects.create(
                user=user,
                token=uuid.uuid4().hex,
                expires_at=timezone.now() + timedelta(hours=1),
            )
            send_mail(
                'Reset your Asa Academy password',
                f'Use this code to reset your password: {reset.token}',
                None,
                [user.email],
                fail_silently=True,
            )
        # Always return 200 so the endpoint can't be used to enumerate accounts.
        return Response({'detail': 'If that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset = serializer.context['reset']
        reset.user.set_password(serializer.validated_data['new_password'])
        reset.user.save()
        reset.used_at = timezone.now()
        reset.save(update_fields=['used_at'])
        return Response({'detail': 'Password has been reset successfully.'})


class EmailVerificationConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verification = serializer.context['verification']
        verification.user.email_verified = True
        verification.user.save(update_fields=['email_verified'])
        verification.verified_at = timezone.now()
        verification.save(update_fields=['verified_at'])
        return Response({'detail': 'Email verified successfully.'})


class InstructorListView(generics.ListAPIView):
    """Public list of instructors, with aggregate course/rating stats, for the marketing site."""

    serializer_class = InstructorPublicSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            User.objects.filter(user_type=User.UserType.INSTRUCTOR, status=User.Status.ACTIVE)
            .select_related('instructor_profile')
            .annotate(
                course_count=Count('courses_taught', distinct=True),
                student_count=Count('courses_taught__enrollments', distinct=True),
                average_rating=Avg('courses_taught__reviews__rating'),
            )
            .filter(course_count__gt=0)
            .order_by('-student_count')
        )


class UserViewSet(viewsets.ModelViewSet):
    """Full management (create/update/delete) is admin-only; list/retrieve are
    open to any authenticated user (with a minimal public serializer) so
    features like the message composer can offer a recipient picker."""

    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve') and not (self.request.user.is_staff or self.request.user.user_type == 'admin'):
            return UserPublicSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return AdminUserSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            roles = [r for r in role.split(',') if r]
            qs = qs.filter(user_type__in=roles) if len(roles) > 1 else qs.filter(user_type=roles[0])
        return qs


class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin-only audit log of login attempts (see accounts.LoginHistory,
    populated from CustomTokenObtainPairView on every login)."""

    queryset = LoginHistory.objects.select_related('user').all()
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(login_status=status_param)
        return qs
