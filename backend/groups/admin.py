from django.contrib import admin

from .models import StudentGroup, StudentGroupMembership


class StudentGroupMembershipInline(admin.TabularInline):
    model = StudentGroupMembership
    extra = 1


@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'instructor', 'created_at')
    list_filter = ('course',)
    search_fields = ('name', 'course__title', 'instructor__email')
    inlines = [StudentGroupMembershipInline]


admin.site.register(StudentGroupMembership)
