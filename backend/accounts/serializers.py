from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.text import slugify
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import InstructorProfile, LoginHistory, OTP, PlatformSettings, StudentProfile

User = get_user_model()


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'student_number', 'institution_name', 'department', 'program',
            'academic_level', 'admission_date', 'expected_completion_date', 'biography',
        ]
        read_only_fields = ['id', 'student_number']


class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorProfile
        fields = [
            'id', 'staff_number', 'qualification', 'specialization', 'department',
            'biography', 'years_of_experience', 'linkedin_url',
        ]
        read_only_fields = ['id', 'staff_number']


class ProfilePictureUrlMixin:
    """A pasted profile_picture_url is the intended "current" avatar even
    when an uploaded file also exists — every existing frontend read site
    already renders `profile_picture` directly, so folding the override in
    here means they pick it up with no template changes (same pattern as
    Course.thumbnail_url)."""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if getattr(instance, 'profile_picture_url', None):
            data['profile_picture'] = instance.profile_picture_url
        return data


class UserSerializer(ProfilePictureUrlMixin, serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    instructor_profile = InstructorProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'phone_number', 'profile_picture', 'profile_picture_url', 'gender', 'date_of_birth', 'address',
            'country', 'city', 'user_type', 'status', 'email_verified', 'two_factor_enabled', 'date_joined',
            'last_login', 'student_profile', 'instructor_profile',
        ]
        read_only_fields = ['id', 'user_type', 'status', 'email_verified', 'date_joined', 'last_login']


class AdminUserSerializer(UserSerializer):
    """Used by UserViewSet for admin-driven create/update of any account
    type. Unlike RegisterSerializer (public self-registration, always
    LEARNER/STUDENT) this lets an authenticated Admin set role, status, and
    an initial/replacement password directly — for the dedicated Instructor
    invitation flow, see InstructorCreateSerializer instead, which forces
    the role server-side and never accepts a password from the Admin."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['password']
        read_only_fields = ['id', 'email_verified', 'date_joined', 'last_login']

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user


class InstructorPublicSerializer(ProfilePictureUrlMixin, serializers.ModelSerializer):
    """Public, marketing-site representation of an instructor with aggregate stats."""

    full_name = serializers.ReadOnlyField()
    title = serializers.SerializerMethodField()
    linkedin_url = serializers.SerializerMethodField()
    course_count = serializers.IntegerField(read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'profile_picture', 'title', 'linkedin_url',
            'course_count', 'student_count', 'average_rating',
        ]

    def get_title(self, obj):
        profile = getattr(obj, 'instructor_profile', None)
        return profile.specialization if profile and profile.specialization else 'Instructor'

    def get_linkedin_url(self, obj):
        profile = getattr(obj, 'instructor_profile', None)
        return profile.linkedin_url if profile and profile.linkedin_url else None

    def get_average_rating(self, obj):
        return round(obj.average_rating, 2) if obj.average_rating else None


class UserPublicSerializer(ProfilePictureUrlMixin, serializers.ModelSerializer):
    """Minimal, safe-to-expose representation used when nested in other resources."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_picture', 'user_type']


class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = LoginHistory
        fields = [
            'id', 'user', 'ip_address', 'device_information', 'browser_information',
            'login_status', 'login_at', 'logout_at',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Public self-registration — Authentication.md §5/§8: the role is
    always LEARNER (this project's `student` user_type). A `user_type` (or
    any other role hint) submitted by the client is silently ignored, never
    trusted — see `create()`."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    # Django's own AbstractUser defines first_name/last_name with blank=True,
    # which DRF's ModelSerializer would otherwise infer as optional — the
    # spec (FR-REG-002) requires both, so make that explicit here.
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)
    accept_terms = serializers.BooleanField(write_only=True)
    accept_privacy_policy = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone_number', 'accept_terms', 'accept_privacy_policy',
        ]

    def validate_accept_terms(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the Terms and Conditions to register.')
        return value

    def validate_accept_privacy_policy(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the Privacy Policy to register.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('accept_terms', None)
        validated_data.pop('accept_privacy_policy', None)
        password = validated_data.pop('password')
        user = User(
            **validated_data,
            user_type=User.UserType.STUDENT,
            status=User.Status.PENDING_VERIFICATION,
            email_verified=False,
        )
        user.set_password(password)
        user.save()
        StudentProfile.objects.create(user=user)
        return user


class InstructorCreateSerializer(serializers.ModelSerializer):
    """Admin-only (see IsAdmin-gated view). Authentication.md §14/§15/§18:
    the role and initial status are always forced server-side; the Admin
    never sets or sees a password — the Instructor creates their own during
    activation."""

    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        request = self.context['request']
        user = User(
            **validated_data,
            user_type=User.UserType.INSTRUCTOR,
            status=User.Status.PENDING_ACTIVATION,
            email_verified=False,
            created_by=request.user,
        )
        user.set_unusable_password()
        user.save()
        InstructorProfile.objects.create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Retained for issuing the final token pair once 2FA succeeds (see
    accounts.views.Verify2FAView) — get_token()'s claim shape is reused
    there directly rather than going through the full password-auth flow
    this serializer's own validate() implements, since that flow no longer
    grants tokens by itself (Authentication.md §11/§16)."""

    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_type'] = user.user_type
        token['full_name'] = user.full_name
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class GoogleAuthSerializer(serializers.Serializer):
    """google-login.md — verifies a Google Identity Services ID token
    server-side and resolves it to a user. Only ever creates or links a
    STUDENT account; an email match against a non-student account is
    rejected rather than silently taking over a staff/instructor login."""

    credential = serializers.CharField(write_only=True)

    def validate_credential(self, value):
        if not settings.GOOGLE_CLIENT_ID:
            raise serializers.ValidationError('Google Sign-In is not configured on this server.')
        try:
            payload = google_id_token.verify_oauth2_token(
                value, google_requests.Request(), settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as exc:
            raise serializers.ValidationError('This Google credential is invalid or has expired.') from exc

        if not payload.get('email_verified'):
            raise serializers.ValidationError('Your Google account email is not verified.')

        self._payload = payload
        return value

    def resolve_user(self):
        """Called after is_valid() — get-or-creates the student User this
        credential belongs to. Not part of validate() itself so the view can
        decide what to do (e.g. status checks) with a plain User back."""
        payload = self._payload
        google_sub = payload['sub']
        email = payload['email']

        user = User.objects.filter(google_id=google_sub).first()
        if user:
            return user

        user = User.objects.filter(email__iexact=email).first()
        if user:
            if user.user_type != User.UserType.STUDENT:
                raise serializers.ValidationError(
                    'This email is linked to a non-student account. Please use standard login instead.'
                )
            user.google_id = google_sub
            user.email_verified = True
            user.save(update_fields=['google_id', 'email_verified'])
            return user

        username = self._generate_username(email)
        user = User(
            username=username,
            email=email,
            first_name=payload.get('given_name', '') or '',
            last_name=payload.get('family_name', '') or '',
            user_type=User.UserType.STUDENT,
            status=User.Status.ACTIVE,
            email_verified=True,
            google_id=google_sub,
            auth_provider=User.AuthProvider.GOOGLE,
        )
        user.set_unusable_password()
        user.save()
        StudentProfile.objects.create(user=user)
        return user

    @staticmethod
    def _generate_username(email):
        base = slugify(email.split('@')[0]) or 'user'
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f'{base}{i}'
        return username


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class LoginSerializer(serializers.Serializer):
    """Step 1 of Authentication.md §16 — validates credentials and account
    status only. Never returns tokens; the view issues a 2FA challenge on
    success instead (see accounts.views.LoginView)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            self.context['request'], username=attrs['email'], password=attrs['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        attrs['user'] = user
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    """Shared shape for the two OTP-by-email flows (registration and
    instructor-activation verification) — both identify the user by email
    rather than a session, since neither has an authenticated session yet."""

    email = serializers.EmailField()
    otp = serializers.RegexField(r'^\d{4,8}$', write_only=True)

    def validate_email(self, value):
        user = User.objects.filter(email__iexact=value).first()
        if not user:
            # Generic message — Authentication.md §34 (avoid account enumeration).
            raise serializers.ValidationError('The verification code is invalid or has expired.')
        self.context['user'] = user
        return value


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=OTP.Purpose.choices)


class Verify2FASerializer(serializers.Serializer):
    """Step 2 of Authentication.md §16 — the challengeId + OTP pair. Holding
    a valid challengeId is not itself sufficient (Authentication.md §13);
    the OTP must also match."""

    challenge_id = serializers.UUIDField()
    otp = serializers.RegexField(r'^\d{4,8}$', write_only=True)


class InstructorActivateSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.RegexField(r'^\d{4,8}$', write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_email(self, value):
        user = User.objects.filter(email__iexact=value).first()
        if not user:
            raise serializers.ValidationError('The verification code is invalid or has expired.')
        self.context['user'] = user
        return value


class PlatformSettingsSerializer(serializers.ModelSerializer):
    currency_symbol = serializers.ReadOnlyField()
    currency_choices = serializers.SerializerMethodField()

    class Meta:
        model = PlatformSettings
        fields = ['currency_code', 'currency_symbol', 'currency_choices', 'updated_at']
        read_only_fields = ['currency_symbol', 'currency_choices', 'updated_at']

    def get_currency_choices(self, obj):
        return [{'code': code, 'label': label} for code, label in PlatformSettings.Currency.choices]
