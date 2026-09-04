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
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'
        BLOCKED = 'blocked', 'Blocked'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'
        UNSPECIFIED = 'unspecified', 'Prefer not to say'

    email = models.EmailField(unique=True)
    middle_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    user_type = models.CharField(max_length=20, choices=UserType.choices, default=UserType.STUDENT)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    email_verified = models.BooleanField(default=False)
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


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Password reset for {self.user}'


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Email verification for {self.user}'
