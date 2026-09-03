from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'student', 'course', 'status', 'issue_date')
    list_filter = ('status',)
    search_fields = ('certificate_number', 'verification_code')
