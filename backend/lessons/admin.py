from django.contrib import admin

from .models import LearningResource, Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type', 'status', 'order')
    list_filter = ('lesson_type', 'status')
    search_fields = ('title',)


admin.site.register(LearningResource)
