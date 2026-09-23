from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import emails
from .audit import log_event
from .invitations import build_activation_url, generate_invitation, resolve_invitation
from .models import InstructorInvitation, InstructorProfile, LoginChallenge, LoginHistory, OTP, PlatformSettings, StudentProfile
from .otp import (
    OTPVerificationError, issue_otp, seconds_until_resend_allowed, verify_otp,
)
from .permissions import IsAdmin
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    GoogleAuthSerializer,
    InstructorActivateSerializer,
    InstructorCreateSerializer,
    InstructorProfileSerializer,
    InstructorPublicSerializer,
    LoginHistorySerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    PlatformSettingsSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    StudentProfileSerializer,
    UserPublicSerializer,
    UserSerializer,
    Verify2FASerializer,
    VerifyOTPSerializer,
)

User = get_user_model()

# How many failed logins within this window locks the account (Authentication.md SEC-005).
LOGIN_FAILURE_LOCK_THRESHOLD = 5
LOGIN_FAILURE_LOCK_WINDOW_MINUTES = 15

STATUS_LOGIN_MESSAGES = {
    User.Status.PENDING_VERIFICATION: 'Please verify your email address before logging in.',
    User.Status.PENDING_ACTIVATION: 'Please complete your account activation. Check your email for instructions.',
    User.Status.SUSPENDED: 'Your account has been suspended. Please contact Asa Academy support.',
    User.Status.LOCKED: 'Your account has been locked for security reasons. Please contact Asa Academy support.',
    User.Status.INACTIVE: 'This account is not active. Please contact Asa Academy support.',
    User.Status.BLOCKED: 'This account is not available. Please contact Asa Academy support.',
}


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')


def masked_email(email):
    name, _, domain = email.partition('@')
    if len(name) <= 2:
        visible = name[:1]
    else:
        visible = name[:2]
    return f'{visible}{"*" * max(3, len(name) - len(visible))}@{domain}'


class RegisterView(generics.CreateAPIView):
    """Authentication.md §5-10 — public self-registration. Always creates a
    STUDENT (LEARNER) account in PENDING_VERIFICATION and emails a
    registration OTP; the role field is never accepted from the client
    (see RegisterSerializer.create)."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_register'
    throttle_classes = [ScopedRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        _, code = issue_otp(user, OTP.Purpose.REGISTRATION)
        emails.send_registration_otp_email(user, code)
        log_event('USER_REGISTRATION', user=user, request=request)
        log_event('EMAIL_OTP_SENT', user=user, request=request, purpose='registration')

        return Response(
            {'message': 'Registration successful. Please check your email for your verification code.',
             'verification_required': True, 'email': user.email},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """Authentication.md §9-13, §20 — POST /api/auth/verify-email. Confirms
    a REGISTRATION OTP and activates the learner account."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_otp_verify'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

        try:
            verify_otp(user, OTP.Purpose.REGISTRATION, serializer.validated_data['otp'])
        except OTPVerificationError as exc:
            log_event('EMAIL_VERIFICATION_FAILED', user=user, request=request, result='failure')
            raise ValidationError({'otp': str(exc)})

        user.email_verified = True
        user.status = User.Status.ACTIVE
        user.save(update_fields=['email_verified', 'status'])
        emails.send_account_activated_email(user)
        log_event('EMAIL_VERIFICATION_SUCCESS', user=user, request=request)

        return Response({'message': 'Your email has been verified successfully.', 'status': user.status})


class ResendOTPView(APIView):
    """Authentication.md §14 — rate-limited, cooldown-enforced OTP resend
    shared by every OTP purpose. Responds generically when the email isn't
    recognized, to avoid account enumeration (Authentication.md §34)."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_otp_resend'
    throttle_classes = [ScopedRateThrottle]

    GENERIC_RESPONSE = {'message': 'If an account matches that request, a new verification code has been sent.'}

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(self.GENERIC_RESPONSE)

        wait = seconds_until_resend_allowed(user, purpose)
        if wait > 0:
            raise Throttled(wait=wait, detail='Please wait before requesting another verification code.')

        _, code = issue_otp(user, purpose)
        if purpose == OTP.Purpose.REGISTRATION:
            emails.send_registration_otp_email(user, code)
        elif purpose == OTP.Purpose.INSTRUCTOR_ACTIVATION:
            emails.send_instructor_verification_email(user, code)
        elif purpose == OTP.Purpose.PASSWORD_RESET:
            emails.send_password_reset_email(user, code)
        elif purpose == OTP.Purpose.LOGIN_2FA:
            emails.send_login_2fa_email(user, code)
        log_event('OTP_RESEND', user=user, request=request, purpose=purpose)

        return Response(self.GENERIC_RESPONSE)


def _issue_login_challenge(user, request):
    otp_row, code = issue_otp(user, OTP.Purpose.LOGIN_2FA)
    challenge = LoginChallenge.objects.create(
        user=user, otp=otp_row, expires_at=timezone.now() + timedelta(minutes=settings.OTP_EXPIRATION_MINUTES),
    )
    if user.user_type == User.UserType.INSTRUCTOR:
        emails.send_instructor_2fa_email(user, code)
    else:
        emails.send_login_2fa_email(user, code)
    log_event('2FA_REQUESTED', user=user, request=request)
    return challenge


class LoginView(APIView):
    """Authentication.md §11, §16, §23 — step 1 of login. Validates the
    password and account status, then always issues an email 2FA challenge
    instead of tokens — unconditionally, per the spec's login flow, not
    based on the account's two_factor_enabled value (that field isn't
    read here; it's stored for a future per-account opt-out but doesn't
    gate anything yet)."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_login'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        user = User.objects.filter(email__iexact=email).first() if email else None

        if user and user.status == User.Status.LOCKED:
            log_event('LOGIN_FAILED', user=user, request=request, result='failure', reason='locked')
            raise ValidationError({'detail': STATUS_LOGIN_MESSAGES[User.Status.LOCKED]})

        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            if user:
                self._record_failure_and_maybe_lock(user, request)
            raise ValidationError({'detail': 'Invalid email or password.'})

        user = serializer.validated_data['user']

        if user.status != User.Status.ACTIVE:
            log_event('LOGIN_FAILED', user=user, request=request, result='failure', reason=user.status)
            raise ValidationError({'detail': STATUS_LOGIN_MESSAGES.get(user.status, 'This account cannot log in right now.')})

        challenge = _issue_login_challenge(user, request)
        return Response({
            'requires_two_factor': True,
            'challenge_id': str(challenge.id),
            'masked_email': masked_email(user.email),
        })

    def _record_failure_and_maybe_lock(self, user, request):
        LoginHistory.objects.create(
            user=user, ip_address=client_ip(request),
            device_information=request.META.get('HTTP_USER_AGENT', '')[:255],
            login_status=LoginHistory.LoginStatus.FAILED,
        )
        log_event('LOGIN_FAILED', user=user, request=request, result='failure', reason='bad_password')

        window_start = timezone.now() - timedelta(minutes=LOGIN_FAILURE_LOCK_WINDOW_MINUTES)
        recent_failures = LoginHistory.objects.filter(
            user=user, login_status=LoginHistory.LoginStatus.FAILED, login_at__gte=window_start,
        ).count()
        if recent_failures >= LOGIN_FAILURE_LOCK_THRESHOLD and user.status == User.Status.ACTIVE:
            user.status = User.Status.LOCKED
            user.save(update_fields=['status'])
            log_event('ACCOUNT_LOCKED', user=user, request=request, reason='too_many_failed_logins')
            emails.send_security_alert_email(
                user, 'Multiple failed login attempts', client_ip(request),
                request.META.get('HTTP_USER_AGENT', '')[:255],
            )


class Verify2FAView(APIView):
    """Authentication.md §11-13, §16 — step 2 of login. Only a valid,
    unexpired, unused challengeId *and* its matching OTP together grant a
    session; the challengeId alone is never sufficient."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_otp_verify'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = Verify2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        challenge = LoginChallenge.objects.select_related('user').filter(
            pk=serializer.validated_data['challenge_id'],
        ).first()
        if not challenge or challenge.used or challenge.expires_at < timezone.now():
            raise ValidationError({'otp': 'This verification session has expired. Please log in again.'})

        user = challenge.user
        try:
            verify_otp(user, OTP.Purpose.LOGIN_2FA, serializer.validated_data['otp'])
        except OTPVerificationError as exc:
            log_event('2FA_FAILED', user=user, request=request, result='failure')
            raise ValidationError({'otp': str(exc)})

        challenge.used = True
        challenge.save(update_fields=['used'])
        log_event('2FA_SUCCESS', user=user, request=request)

        token = CustomTokenObtainPairSerializer.get_token(user)
        LoginHistory.objects.create(
            user=user, ip_address=client_ip(request),
            device_information=request.META.get('HTTP_USER_AGENT', '')[:255],
            login_status=LoginHistory.LoginStatus.SUCCESSFUL,
        )
        log_event('LOGIN_SUCCESS', user=user, request=request)

        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'user': UserSerializer(user).data,
        })


class GoogleLoginView(APIView):
    """google-login.md — "Continue with Google" for students. Verifies a
    Google Identity Services ID token server-side and issues tokens
    directly, skipping the email 2FA challenge that password login requires
    — Google's own sign-in already provides strong assurance for a verified
    email, so there's nothing left to challenge."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_login'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.resolve_user()

        if user.status != User.Status.ACTIVE:
            log_event('LOGIN_FAILED', user=user, request=request, result='failure', reason=user.status)
            raise ValidationError({'detail': STATUS_LOGIN_MESSAGES.get(user.status, 'This account cannot log in right now.')})

        token = CustomTokenObtainPairSerializer.get_token(user)
        LoginHistory.objects.create(
            user=user, ip_address=client_ip(request),
            device_information=request.META.get('HTTP_USER_AGENT', '')[:255],
            login_status=LoginHistory.LoginStatus.SUCCESSFUL,
        )
        log_event('LOGIN_SUCCESS', user=user, request=request, method='google')

        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
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
        emails.send_password_changed_email(request.user)
        log_event('PASSWORD_CHANGED', user=request.user, request=request)
        return Response({'detail': 'Password updated successfully.'})


class PasswordResetRequestView(APIView):
    """Authentication.md §24 — always returns the same generic response
    regardless of whether the email exists, to avoid account enumeration."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_password_reset'
    throttle_classes = [ScopedRateThrottle]

    GENERIC_RESPONSE = {'detail': 'If that email exists, a password reset code has been sent.'}

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data['email']).first()
        if user:
            _, code = issue_otp(user, OTP.Purpose.PASSWORD_RESET)
            emails.send_password_reset_email(user, code)
            log_event('PASSWORD_RESET_REQUESTED', user=user, request=request)
        return Response(self.GENERIC_RESPONSE)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_password_reset'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

        try:
            verify_otp(user, OTP.Purpose.PASSWORD_RESET, serializer.validated_data['otp'])
        except OTPVerificationError as exc:
            raise ValidationError({'otp': str(exc)})

        user.set_password(serializer.validated_data['new_password'])
        # A successful reset also proves the mailbox is reachable and clears
        # any prior lockout — matches "Password Changed" email semantics.
        if user.status == User.Status.LOCKED:
            user.status = User.Status.ACTIVE
        user.save()
        emails.send_password_changed_email(user)
        log_event('PASSWORD_CHANGED', user=user, request=request, via='reset')
        return Response({'detail': 'Password has been reset successfully.'})


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


class InstructorActivateView(APIView):
    """Authentication.md §6-7, §19 — step 1 of instructor activation: a
    valid invitation lets the Instructor set their own password. Does not
    by itself change account status; email verification (next step) does."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_otp_verify'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = InstructorActivateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invitation = resolve_invitation(serializer.validated_data['token'])
        if not invitation:
            raise ValidationError({'token': 'This invitation is invalid or has already been used.'})
        if invitation.expires_at < timezone.now():
            raise ValidationError({
                'token': 'This invitation has expired. Please contact the Asa Academy administration team for a new invitation.',
            })

        user = invitation.user
        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])
        invitation.used = True
        invitation.used_at = timezone.now()
        invitation.save(update_fields=['used', 'used_at'])
        log_event('INSTRUCTOR_ACTIVATION_STARTED', user=user, request=request)

        _, code = issue_otp(user, OTP.Purpose.INSTRUCTOR_ACTIVATION)
        emails.send_instructor_verification_email(user, code)

        return Response({
            'message': 'Password set. Please check your email for a verification code to confirm your email address.',
            'email': user.email,
        })


class InstructorVerifyEmailView(APIView):
    """Authentication.md §8, §11 — step 2 of instructor activation. Once
    verified the account becomes ACTIVE; the required 2FA factor is then
    completed the same way as any login, via LoginView/Verify2FAView."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth_otp_verify'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context['user']

        try:
            verify_otp(user, OTP.Purpose.INSTRUCTOR_ACTIVATION, serializer.validated_data['otp'])
        except OTPVerificationError as exc:
            log_event('EMAIL_VERIFICATION_FAILED', user=user, request=request, result='failure')
            raise ValidationError({'otp': str(exc)})

        user.email_verified = True
        user.status = User.Status.ACTIVE
        user.save(update_fields=['email_verified', 'status'])
        emails.send_account_activated_email(user)
        log_event('INSTRUCTOR_ACTIVATED', user=user, request=request)

        return Response({'message': 'Your instructor account is now active. You can log in.', 'status': user.status})


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
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=False, methods=['post'], url_path='create-instructor', throttle_classes=[ScopedRateThrottle])
    def create_instructor(self, request):
        """Authentication.md §14-18 — Admin → User Management → Instructors
        → Create Instructor. Role and PENDING_ACTIVATION status are forced
        server-side; no password is accepted here."""
        self.throttle_scope = 'auth_instructor_invite'
        if not (request.user.is_staff or request.user.user_type == 'admin'):
            raise PermissionDenied('Only administrators can create Instructor accounts.')

        serializer = InstructorCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        invitation, raw_token = generate_invitation(user, created_by=request.user)
        emails.send_instructor_invitation_email(user, build_activation_url(raw_token))
        log_event('INSTRUCTOR_CREATED', user=user, request=request, created_by=request.user.email)
        log_event('INSTRUCTOR_INVITATION_SENT', user=user, request=request)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='resend-invitation', throttle_classes=[ScopedRateThrottle])
    def resend_invitation(self, request, pk=None):
        """Authentication.md §13/§38 — invalidate any pending invitation and
        send a fresh one. Only meaningful for PENDING_ACTIVATION instructors."""
        self.throttle_scope = 'auth_instructor_invite'
        if not (request.user.is_staff or request.user.user_type == 'admin'):
            raise PermissionDenied('Only administrators can resend Instructor invitations.')

        user = self.get_object()
        if user.user_type != User.UserType.INSTRUCTOR or user.status != User.Status.PENDING_ACTIVATION:
            raise ValidationError({'detail': 'This user does not have a pending Instructor invitation.'})

        InstructorInvitation.objects.filter(user=user, used=False).update(used=True, used_at=timezone.now())
        invitation, raw_token = generate_invitation(user, created_by=request.user)
        emails.send_instructor_invitation_email(user, build_activation_url(raw_token))
        log_event('INSTRUCTOR_INVITATION_SENT', user=user, request=request, resend=True)

        return Response({'detail': 'A new invitation has been sent.'})


class PlatformSettingsView(APIView):
    """Platform-wide configuration (currently just the display currency).
    Reading is public — course pricing needs it before login — but only
    admins can change it."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        return Response(PlatformSettingsSerializer(PlatformSettings.load()).data)

    def patch(self, request):
        obj = PlatformSettings.load()
        serializer = PlatformSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        log_event('PLATFORM_SETTINGS_UPDATED', user=request.user, request=request, **serializer.validated_data)
        return Response(serializer.data)


class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin-only audit log of login attempts (see accounts.LoginHistory,
    populated from LoginView/Verify2FAView on every login)."""

    queryset = LoginHistory.objects.select_related('user').all()
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAdmin]
    search_fields = ['user__username', 'user__email', 'ip_address', 'device_information']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(login_status=status_param)
        return qs
