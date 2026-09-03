from django import forms

from .models import LearningResource, Lesson


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = [
            'module', 'title', 'description', 'lesson_type', 'content', 'content_url',
            'video_url', 'duration_minutes', 'order', 'is_preview', 'status',
        ]
        widgets = {'content': forms.Textarea(attrs={'rows': 6})}

    def clean(self):
        cleaned_data = super().clean()
        lesson_type = cleaned_data.get('lesson_type')
        if lesson_type == Lesson.LessonType.VIDEO and not cleaned_data.get('video_url'):
            self.add_error('video_url', 'A video URL is required for video lessons.')
        return cleaned_data


class LearningResourceForm(forms.ModelForm):
    class Meta:
        model = LearningResource
        fields = ['course', 'lesson', 'title', 'resource_type', 'file', 'file_url', 'is_downloadable']

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('file') and not cleaned_data.get('file_url'):
            raise forms.ValidationError('Provide either an uploaded file or a file URL.')
        return cleaned_data
