from django import forms

from .models import LessonProgress


class LessonProgressForm(forms.ModelForm):
    class Meta:
        model = LessonProgress
        fields = ['student', 'course', 'lesson', 'progress_percentage', 'is_completed', 'time_spent_seconds']

    def clean_progress_percentage(self):
        value = self.cleaned_data['progress_percentage']
        if value < 0 or value > 100:
            raise forms.ValidationError('Progress must be between 0 and 100.')
        return value
