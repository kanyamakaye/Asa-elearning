from django.contrib import admin

from .models import DiscussionReply, DiscussionTopic


@admin.register(DiscussionTopic)
class DiscussionTopicAdmin(admin.ModelAdmin):
    # DiscussionTopicForm/DiscussionReplyForm (forms.py) omit `created_by`/`user`
    # since those are set from the current user in the app flow; the admin uses
    # Django's default full-field form so staff can pick them explicitly.
    list_display = ('title', 'course', 'created_by', 'status', 'is_pinned')
    list_filter = ('status', 'is_pinned')


@admin.register(DiscussionReply)
class DiscussionReplyAdmin(admin.ModelAdmin):
    list_display = ('topic', 'user', 'created_at')
