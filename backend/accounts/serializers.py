from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import EmailVerificationToken, InstructorProfile, LoginHistory, PasswordResetToken, StudentProfile

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
            'biography', 'years_of_experience',
        ]
        read_only_fields = ['id', 'staff_number']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    instructor_profile = InstructorProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'phone_number', 'profile_picture', 'gender', 'date_of_birth', 'address', 'country',
            'city', 'user_type', 'status', 'email_verified', 'date_joined', 'last_login',
            'student_profile', 'instructor_profile',
        ]
        read_only_fields = ['id', 'user_type', 'status', 'email_verified', 'date_joined', 'last_login']


class InstructorPublicSerializer(serializers.ModelSerializer):
    """Public, marketing-site representation of an instructor with aggregate stats."""

    full_name = serializers.ReadOnlyField()
    title = serializers.SerializerMethodField()
    course_count = serializers.IntegerField(read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_picture', 'title', 'course_count', 'student_count', 'average_rating']

    def get_title(self, obj):
        profile = getattr(obj, 'instructor_profile', None)
        return profile.specialization if profile and profile.specialization else 'Instructor'

    def get_average_rating(self, obj):
        return round(obj.average_rating, 2) if obj.average_rating else None


class UserPublicSerializer(serializers.ModelSerializer):
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
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=[User.UserType.STUDENT, User.UserType.INSTRUCTOR])

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'user_type', 'phone_number',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if user.user_type == User.UserType.STUDENT:
            StudentProfile.objects.create(user=user)
        elif user.user_type == User.UserType.INSTRUCTOR:
            InstructorProfile.objects.create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
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


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_token(self, value):
        try:
            reset = PasswordResetToken.objects.get(token=value, used_at__isnull=True)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or already-used token.')
        from django.utils import timezone
        if reset.expires_at < timezone.now():
            raise serializers.ValidationError('This reset token has expired.')
        self.context['reset'] = reset
        return value


class EmailVerificationConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            verification = EmailVerificationToken.objects.get(token=value, verified_at__isnull=True)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or already-used token.')
        from django.utils import timezone
        if verification.expires_at < timezone.now():
            raise serializers.ValidationError('This verification token has expired.')
        self.context['verification'] = verification
        return value
