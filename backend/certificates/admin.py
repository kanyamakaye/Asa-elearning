from django.contrib import admin

from .forms import CertificateForm
from .models import Badge, Certificate, UserBadge


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    form = CertificateForm
    list_display = ('certificate_number', 'student', 'course', 'status', 'issue_date', 'expires_at')
    list_filter = ('status',)
    search_fields = ('certificate_number', 'verification_code')


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'trigger', 'icon')


admin.site.register(UserBadge)
