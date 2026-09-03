from django.contrib import admin

from .forms import AssignmentForm
from .models import Assignment, AssignmentSubmission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    form = AssignmentForm
    list_display = ('title', 'course', 'due_date', 'status', 'maximum_marks')
    list_filter = ('status',)


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'status', 'marks_awarded', 'is_late')
    list_filter = ('status', 'is_late')
