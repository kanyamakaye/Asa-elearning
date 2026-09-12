from django.contrib import admin

from .models import GroupCourseAssignment, StudentGroup, StudentGroupMembership


class StudentGroupMembershipInline(admin.TabularInline):
    model = StudentGroupMembership
    extra = 1


class GroupCourseAssignmentInline(admin.TabularInline):
    model = GroupCourseAssignment
    extra = 1
    fields = ('course', 'assigned_by', 'assigned_at')
    readonly_fields = ('assigned_at',)


@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_list', 'instructor', 'created_at')
    list_filter = ('courses',)
    search_fields = ('name', 'courses__title', 'instructor__email')
    inlines = [StudentGroupMembershipInline, GroupCourseAssignmentInline]

    def course_list(self, obj):
        return ', '.join(obj.courses.values_list('title', flat=True)) or '—'
    course_list.short_description = 'Courses'


admin.site.register(StudentGroupMembership)
admin.site.register(GroupCourseAssignment)
