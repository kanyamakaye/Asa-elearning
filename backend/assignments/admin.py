from django.contrib import admin

from .forms import AssignmentForm
from .models import Assignment, AssignmentSubmission, Rubric, RubricCriterion


class RubricCriterionInline(admin.TabularInline):
    model = RubricCriterion
    extra = 2


@admin.register(Rubric)
class RubricAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    inlines = [RubricCriterionInline]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    form = AssignmentForm
    list_display = ('title', 'course', 'due_date', 'status', 'submission_type', 'maximum_marks')
    list_filter = ('status', 'submission_type')
    search_fields = ('title', 'course__title')


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'status', 'marks_awarded', 'is_late')
    list_filter = ('status', 'is_late')
    search_fields = ('student__email', 'assignment__title')
