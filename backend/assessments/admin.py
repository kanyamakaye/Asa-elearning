from django.contrib import admin

from .forms import ExamForm, GradeForm, QuizForm, QuizQuestionForm
from .models import Exam, Grade, QuestionOption, Quiz, QuizAnswer, QuizAttempt, QuizQuestion


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 2


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    form = QuizForm
    list_display = ('title', 'course', 'status', 'total_marks', 'passing_marks')
    list_filter = ('status',)
    inlines = [QuizQuestionInline]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    form = QuizQuestionForm
    list_display = ('quiz', 'question_type', 'marks', 'order')
    inlines = [QuestionOptionInline]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    form = ExamForm
    list_display = ('title', 'course', 'exam_date', 'status')


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    form = GradeForm
    list_display = ('student', 'course', 'assessment_type', 'letter_grade', 'percentage')


admin.site.register(QuestionOption)
admin.site.register(QuizAttempt)
admin.site.register(QuizAnswer)
