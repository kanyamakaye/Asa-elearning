from django import forms

from .models import Course, CourseCategory, CourseInstructor, CourseModule


class CourseCategoryForm(forms.ModelForm):
    class Meta:
        model = CourseCategory
        fields = ['name', 'description', 'image', 'is_active']


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'category', 'level', 'language',
            'duration_hours', 'image', 'video_url', 'price', 'is_free', 'status',
            'enrollment_limit', 'start_date', 'end_date', 'certificate_enabled',
        ]
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 5}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start_date')
        end = cleaned_data.get('end_date')
        if start and end and end < start:
            self.add_error('end_date', 'Must be on or after the start date.')
        if cleaned_data.get('is_free') and cleaned_data.get('price'):
            cleaned_data['price'] = 0
        return cleaned_data


class CourseModuleForm(forms.ModelForm):
    class Meta:
        model = CourseModule
        fields = ['course', 'title', 'description', 'order', 'status']


class CourseInstructorForm(forms.ModelForm):
    class Meta:
        model = CourseInstructor
        fields = ['course', 'instructor', 'instructor_role']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['instructor'].queryset = self.fields['instructor'].queryset.filter(user_type='instructor')

    def clean(self):
        cleaned_data = super().clean()
        course = cleaned_data.get('course')
        instructor = cleaned_data.get('instructor')
        if course and instructor and course.instructor_id == instructor.id:
            raise forms.ValidationError('This instructor is already the primary instructor for the course.')
        return cleaned_data
