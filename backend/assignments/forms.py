from django.utils import timezone
from django import forms

from .models import Assignment, AssignmentSubmission


class AssignmentForm(forms.ModelForm):
    class Meta:
        model = Assignment
        fields = [
            'course', 'module', 'lesson', 'title', 'description', 'instructions', 'maximum_marks',
            'passing_marks', 'due_date', 'submission_type', 'allowed_file_types', 'max_file_size',
            'allow_late_submission', 'late_penalty', 'attachment', 'status',
        ]
        widgets = {
            'due_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 5}),
        }

    def clean(self):
        cleaned_data = super().clean()
        maximum = cleaned_data.get('maximum_marks')
        passing = cleaned_data.get('passing_marks')
        if maximum is not None and passing is not None and passing > maximum:
            self.add_error('passing_marks', 'Cannot exceed the maximum marks.')
        return cleaned_data


class AssignmentSubmissionForm(forms.ModelForm):
    class Meta:
        model = AssignmentSubmission
        fields = ['assignment', 'submission_text', 'file']

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('submission_text') and not cleaned_data.get('file'):
            raise forms.ValidationError('Submit either text or a file.')
        assignment = cleaned_data.get('assignment')
        if assignment and assignment.due_date and timezone.now() > assignment.due_date:
            if not assignment.allow_late_submission:
                raise forms.ValidationError('The due date for this assignment has passed.')
        return cleaned_data


class GradeSubmissionForm(forms.ModelForm):
    class Meta:
        model = AssignmentSubmission
        fields = ['marks_awarded', 'feedback']

    def clean_marks_awarded(self):
        value = self.cleaned_data['marks_awarded']
        max_marks = self.instance.assignment.maximum_marks if self.instance_id_ok() else None
        if max_marks is not None and value is not None and value > max_marks:
            raise forms.ValidationError(f'Cannot exceed the assignment maximum of {max_marks}.')
        return value

    def instance_id_ok(self):
        return bool(self.instance and self.instance.assignment_id)
