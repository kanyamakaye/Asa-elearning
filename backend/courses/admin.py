from django.contrib import admin

from .models import Course, CourseCategory, CourseInstructor, CourseModule


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'course_code', 'instructor', 'category', 'status', 'price', 'created_at')
    list_filter = ('status', 'level', 'is_free', 'category')
    search_fields = ('title', 'course_code')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [CourseModuleInline]


admin.site.register(CourseCategory)
admin.site.register(CourseInstructor)
admin.site.register(CourseModule)
