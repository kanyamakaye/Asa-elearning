from django.contrib import admin

from .forms import AnnouncementForm, NotificationForm
from .models import Announcement, Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    form = NotificationForm
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('is_read', 'notification_type')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    form = AnnouncementForm
    list_display = ('title', 'audience_type', 'status', 'publish_date')
    list_filter = ('status', 'audience_type')
