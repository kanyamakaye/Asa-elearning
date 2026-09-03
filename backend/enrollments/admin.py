from django.contrib import admin

from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'completion_percentage', 'certificate_issued')
    list_filter = ('status', 'certificate_issued')
    search_fields = ('student__username', 'course__title')
