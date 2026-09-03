from django.contrib import admin

from .forms import CourseInstructorForm
from .models import Course, CourseCategory, CourseInstructor, CourseModule


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # Note: CourseForm (courses/forms.py) is scoped for the "instructor creates
    # their own course" app flow, where `instructor` is implied by the current
    # user and so isn't a form field. The admin needs to assign courses to any
    # instructor explicitly, so it keeps Django's default full-field form here.
    list_display = ('title', 'course_code', 'instructor', 'category', 'status', 'price', 'created_at')
    list_filter = ('status', 'level', 'is_free', 'category')
    search_fields = ('title', 'course_code')
    inlines = [CourseModuleInline]


@admin.register(CourseInstructor)
class CourseInstructorAdmin(admin.ModelAdmin):
    form = CourseInstructorForm
    list_display = ('course', 'instructor', 'instructor_role')


admin.site.register(CourseCategory)
admin.site.register(CourseModule)
