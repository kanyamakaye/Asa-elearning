from django.contrib import admin

from .models import Attendance, LiveSession


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    # LiveSessionForm (forms.py) omits `instructor` since it's set from the
    # current user in the app flow; the admin uses Django's default full-field
    # form so staff can assign sessions to any instructor explicitly.
    list_display = ('title', 'course', 'instructor', 'scheduled_date', 'meeting_platform', 'status')
    list_filter = ('status', 'meeting_platform')
    search_fields = ('title', 'course__title')


admin.site.register(Attendance)
