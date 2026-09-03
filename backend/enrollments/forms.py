from django import forms

from .models import Enrollment


class EnrollmentForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = ['student', 'course', 'status']

    def clean(self):
        cleaned_data = super().clean()
        student = cleaned_data.get('student')
        course = cleaned_data.get('course')
        if student and course:
            qs = Enrollment.objects.filter(student=student, course=course)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise forms.ValidationError('This student is already enrolled in this course.')
            if course.enrollment_limit and course.enrollments.count() >= course.enrollment_limit and not self.instance.pk:
                raise forms.ValidationError('This course has reached its enrollment limit.')
        return cleaned_data
