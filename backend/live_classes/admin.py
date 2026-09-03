from django.contrib import admin

from .models import Attendance, LiveSession


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'instructor', 'scheduled_date', 'status')
    list_filter = ('status',)


admin.site.register(Attendance)
