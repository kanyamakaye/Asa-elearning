from django.contrib import admin

from .forms import ExamForm, GradeForm, QuizForm, QuizQuestionForm
from .models import (
    BankQuestion,
    BankQuestionOption,
    Exam,
    ExamAnswer,
    ExamAttempt,
    ExamQuestion,
    ExamQuestionOption,
    Grade,
    QuestionBank,
    QuestionOption,
    Quiz,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
)


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


class ExamQuestionOptionInline(admin.TabularInline):
    model = ExamQuestionOption
    extra = 2


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 0


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    form = ExamForm
    list_display = ('title', 'course', 'exam_date', 'status')
    inlines = [ExamQuestionInline]


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ('exam', 'question_type', 'marks', 'order')
    inlines = [ExamQuestionOptionInline]


admin.site.register(ExamQuestionOption)
admin.site.register(ExamAttempt)
admin.site.register(ExamAnswer)


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    form = GradeForm
    list_display = ('student', 'course', 'assessment_type', 'letter_grade', 'percentage')


admin.site.register(QuestionOption)
admin.site.register(QuizAttempt)
admin.site.register(QuizAnswer)


class BankQuestionOptionInline(admin.TabularInline):
    model = BankQuestionOption
    extra = 2


class BankQuestionInline(admin.TabularInline):
    model = BankQuestion
    extra = 0


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'course', 'created_by')
    inlines = [BankQuestionInline]


@admin.register(BankQuestion)
class BankQuestionAdmin(admin.ModelAdmin):
    list_display = ('bank', 'question_type', 'difficulty', 'marks')
    inlines = [BankQuestionOptionInline]
