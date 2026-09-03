from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
    EmailVerificationToken,
    InstructorProfile,
    LoginHistory,
    PasswordResetToken,
    Permission,
    Role,
    RolePermission,
    StudentProfile,
    User,
    UserRole,
)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'full_name', 'user_type', 'status', 'is_staff')
    list_filter = ('user_type', 'status', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Asa Academy profile', {
            'fields': (
                'middle_name', 'phone_number', 'profile_picture', 'gender', 'date_of_birth',
                'address', 'country', 'city', 'user_type', 'status', 'email_verified',
            )
        }),
    )


admin.site.register(Role)
admin.site.register(Permission)
admin.site.register(RolePermission)
admin.site.register(UserRole)
admin.site.register(StudentProfile)
admin.site.register(InstructorProfile)
admin.site.register(LoginHistory)
admin.site.register(PasswordResetToken)
admin.site.register(EmailVerificationToken)
