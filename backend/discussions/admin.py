from django.contrib import admin

from .models import DiscussionReply, DiscussionTopic


@admin.register(DiscussionTopic)
class DiscussionTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_by', 'status', 'is_pinned')
    list_filter = ('status', 'is_pinned')


admin.site.register(DiscussionReply)
