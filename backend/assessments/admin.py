from django.contrib import admin

from .models import Exam, Grade, QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 2


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'status', 'total_marks', 'passing_marks')
    list_filter = ('status',)
    inlines = [QuizQuestionInline]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'question_type', 'marks', 'order')
    inlines = [QuestionOptionInline]


admin.site.register(QuestionOption)
admin.site.register(QuizAttempt)
admin.site.register(QuizAnswer)
admin.site.register(Exam)
admin.site.register(Grade)
