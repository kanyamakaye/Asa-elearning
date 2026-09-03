from django import forms
from django.forms import inlineformset_factory

from .models import Exam, Grade, QuestionOption, Quiz, QuizQuestion


class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = [
            'course', 'module', 'lesson', 'title', 'description', 'duration_minutes',
            'total_marks', 'passing_marks', 'attempt_limit', 'shuffle_questions', 'show_answers',
            'available_from', 'available_until', 'status',
        ]
        widgets = {
            'available_from': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'available_until': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        total = cleaned_data.get('total_marks')
        passing = cleaned_data.get('passing_marks')
        if total is not None and passing is not None and passing > total:
            self.add_error('passing_marks', 'Cannot exceed the total marks.')
        available_from = cleaned_data.get('available_from')
        available_until = cleaned_data.get('available_until')
        if available_from and available_until and available_until <= available_from:
            self.add_error('available_until', 'Must be after the opening time.')
        return cleaned_data


class QuizQuestionForm(forms.ModelForm):
    class Meta:
        model = QuizQuestion
        fields = ['quiz', 'question_text', 'question_type', 'marks', 'order', 'explanation']
        widgets = {'question_text': forms.Textarea(attrs={'rows': 3})}


class QuestionOptionForm(forms.ModelForm):
    class Meta:
        model = QuestionOption
        fields = ['option_text', 'is_correct', 'order']


QuestionOptionFormSet = inlineformset_factory(
    QuizQuestion, QuestionOption, form=QuestionOptionForm, extra=4, can_delete=True
)


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = [
            'course', 'title', 'description', 'exam_date', 'start_time', 'end_time',
            'duration_minutes', 'total_marks', 'passing_marks', 'attempt_limit', 'status',
        ]
        widgets = {
            'exam_date': forms.DateInput(attrs={'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'type': 'time'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start_time')
        end = cleaned_data.get('end_time')
        if start and end and end <= start:
            self.add_error('end_time', 'Must be after the start time.')
        return cleaned_data


class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['student', 'course', 'assessment_type', 'assessment_id', 'marks_obtained', 'maximum_marks', 'remarks']

    def clean(self):
        cleaned_data = super().clean()
        obtained = cleaned_data.get('marks_obtained')
        maximum = cleaned_data.get('maximum_marks')
        if obtained is not None and maximum is not None and obtained > maximum:
            self.add_error('marks_obtained', 'Cannot exceed the maximum marks.')
        return cleaned_data
