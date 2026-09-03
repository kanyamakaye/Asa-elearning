from django.contrib import admin

from .forms import EnrollmentForm
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    form = EnrollmentForm
    list_display = ('student', 'course', 'status', 'completion_percentage', 'certificate_issued')
    list_filter = ('status', 'certificate_issued')
    search_fields = ('student__username', 'course__title')
