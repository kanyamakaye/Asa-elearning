from django.contrib import admin

from .forms import CourseInstructorForm
from .models import Course, CourseCategory, CourseInstructor, CourseModule, CourseUnit


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


class CourseUnitInline(admin.TabularInline):
    model = CourseUnit
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # Note: CourseForm (courses/forms.py) is scoped for the "instructor creates
    # their own course" app flow, where `instructor` is implied by the current
    # user and so isn't a form field. The admin needs to assign courses to any
    # instructor explicitly, so it keeps Django's default full-field form here.
    list_display = ('title', 'course_code', 'instructor', 'category', 'status', 'visibility', 'price', 'created_at')
    list_filter = ('status', 'visibility', 'level', 'is_free', 'category')
    search_fields = ('title', 'course_code')
    inlines = [CourseUnitInline]


@admin.register(CourseUnit)
class CourseUnitAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'status')
    list_filter = ('status',)
    inlines = [CourseModuleInline]


@admin.register(CourseInstructor)
class CourseInstructorAdmin(admin.ModelAdmin):
    form = CourseInstructorForm
    list_display = ('course', 'instructor', 'instructor_role')


admin.site.register(CourseCategory)
admin.site.register(CourseModule)
