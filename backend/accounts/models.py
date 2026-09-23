import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class UserType(models.TextChoices):
        ADMIN = 'admin', 'Administrator'
        ACADEMIC_MANAGER = 'academic_manager', 'Academic Manager'
        INSTRUCTOR = 'instructor', 'Instructor'
        STUDENT = 'student', 'Student'
        CONTENT_MANAGER = 'content_manager', 'Content Manager'
        SUPPORT_STAFF = 'support_staff', 'Support Staff'

    class Status(models.TextChoices):
        PENDING_VERIFICATION = 'pending_verification', 'Pending Verification'
        PENDING_ACTIVATION = 'pending_activation', 'Pending Activation'
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'
        LOCKED = 'locked', 'Locked'
        BLOCKED = 'blocked', 'Blocked'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'
        UNSPECIFIED = 'unspecified', 'Prefer not to say'

    class AuthProvider(models.TextChoices):
        PASSWORD = 'password', 'Password'
        GOOGLE = 'google', 'Google'

    email = models.EmailField(unique=True)
    middle_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    profile_picture_url = models.URLField(
        blank=True, help_text='External image URL — takes priority over an uploaded profile picture file when set.'
    )
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    user_type = models.CharField(max_length=20, choices=UserType.choices, default=UserType.STUDENT)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.ACTIVE)
    email_verified = models.BooleanField(default=False)
    google_id = models.CharField(
        max_length=64, unique=True, null=True, blank=True,
        help_text="Google's `sub` claim — set once this account is linked to a Google Sign-In identity.",
    )
    auth_provider = models.CharField(max_length=20, choices=AuthProvider.choices, default=AuthProvider.PASSWORD)
    two_factor_enabled = models.BooleanField(
        default=False, help_text='Whether email-based 2FA is required at login for this account.'
    )
    created_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users',
        help_text='Who provisioned this account — e.g. the admin who created an instructor. Null for self-registration.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.email})'

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p) or self.username


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Permission(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_permissions')

    class Meta:
        unique_together = ('role', 'permission')

    def __str__(self):
        return f'{self.role} -> {self.permission}'


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f'{self.user} -> {self.role}'


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_number = models.CharField(max_length=30, unique=True, blank=True)
    institution_name = models.CharField(max_length=150, blank=True)
    department = models.CharField(max_length=150, blank=True)
    program = models.CharField(max_length=150, blank=True)
    academic_level = models.CharField(max_length=100, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    biography = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.student_number:
            self.student_number = f'STU-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Student profile: {self.user}'


class InstructorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    staff_number = models.CharField(max_length=30, unique=True, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=150, blank=True)
    biography = models.TextField(blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.staff_number:
            self.staff_number = f'INS-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Instructor profile: {self.user}'


class LoginHistory(models.Model):
    class LoginStatus(models.TextChoices):
        SUCCESSFUL = 'successful', 'Successful'
        FAILED = 'failed', 'Failed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history', null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_information = models.CharField(max_length=255, blank=True)
    browser_information = models.CharField(max_length=255, blank=True)
    login_status = models.CharField(max_length=20, choices=LoginStatus.choices, default=LoginStatus.SUCCESSFUL)
    login_at = models.DateTimeField(auto_now_add=True)
    logout_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-login_at']

    def __str__(self):
        return f'{self.user} - {self.login_status} @ {self.login_at}'


class OTP(models.Model):
    """A single, purpose-tagged one-time code — the shared mechanism behind
    registration email verification, login 2FA, password reset, and
    instructor account activation (see accounts.otp for generation/
    verification logic). Replaces the old single-purpose
    EmailVerificationToken/PasswordResetToken link-token models."""

    class Purpose(models.TextChoices):
        REGISTRATION = 'registration', 'Registration'
        LOGIN_2FA = 'login_2fa', 'Login 2FA'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        INSTRUCTOR_ACTIVATION = 'instructor_activation', 'Instructor Activation'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    purpose = models.CharField(max_length=30, choices=Purpose.choices)
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempt_count = models.PositiveIntegerField(default=0)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'purpose', 'used'])]

    def __str__(self):
        return f'{self.purpose} OTP for {self.user}'


class LoginChallenge(models.Model):
    """The temporary, single-use handle ("challengeId") a client holds
    between submitting a valid password and completing email 2FA — kept
    separate from the OTP row itself so a challenge can be invalidated
    independently and never doubles as a bearer credential on its own."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_challenges')
    otp = models.ForeignKey(OTP, on_delete=models.CASCADE, related_name='+')
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Login challenge for {self.user}'


class InstructorInvitation(models.Model):
    """An Admin-issued, single-use invitation letting a newly-created
    Instructor account set its own password and verify its own email —
    the Admin never sets or sees the Instructor's password."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations')
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations_sent',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Instructor invitation for {self.user}'


class AuditLog(models.Model):
    """Security-relevant event trail (registration, OTP lifecycle, 2FA,
    instructor provisioning, password changes, account lockouts, ...) —
    see accounts.audit.log_event(). Login attempts specifically continue to
    use the pre-existing LoginHistory model rather than duplicating that
    here as well."""

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    event_type = models.CharField(max_length=50)
    result = models.CharField(max_length=20, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['event_type', 'created_at'])]

    def __str__(self):
        return f'{self.event_type} @ {self.created_at}'


class PlatformSettings(models.Model):
    """Singleton row (always pk=1) for platform-wide configuration editable
    by admins from the Settings page — currently just the display currency.
    Changing it only relabels prices; it does not convert existing numeric
    amounts between currencies."""

    class Currency(models.TextChoices):
        RWF = 'RWF', 'Rwandan Franc (RWF)'
        USD = 'USD', 'US Dollar ($)'
        EUR = 'EUR', 'Euro (€)'
        GBP = 'GBP', 'British Pound (£)'
        KES = 'KES', 'Kenyan Shilling (KSh)'
        UGX = 'UGX', 'Ugandan Shilling (USh)'
        TZS = 'TZS', 'Tanzanian Shilling (TSh)'
        NGN = 'NGN', 'Nigerian Naira (₦)'
        ZAR = 'ZAR', 'South African Rand (R)'
        GHS = 'GHS', 'Ghanaian Cedi (GH₵)'

    CURRENCY_SYMBOLS = {
        'RWF': 'RWF', 'USD': '$', 'EUR': '€', 'GBP': '£', 'KES': 'KSh',
        'UGX': 'USh', 'TZS': 'TSh', 'NGN': '₦', 'ZAR': 'R', 'GHS': 'GH₵',
    }

    currency_code = models.CharField(max_length=3, choices=Currency.choices, default=Currency.RWF)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    class Meta:
        verbose_name = 'Platform Settings'
        verbose_name_plural = 'Platform Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @property
    def currency_symbol(self):
        return self.CURRENCY_SYMBOLS.get(self.currency_code, self.currency_code)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f'Platform Settings ({self.currency_code})'
