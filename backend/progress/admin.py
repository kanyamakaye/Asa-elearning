from django.contrib import admin

from .models import LessonProgress


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'progress_percentage', 'is_completed')
    list_filter = ('is_completed',)
