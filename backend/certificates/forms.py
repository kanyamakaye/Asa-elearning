from django import forms

from .models import Certificate


class CertificateForm(forms.ModelForm):
    class Meta:
        model = Certificate
        fields = ['student', 'course', 'enrollment', 'certificate_file', 'status']

    def clean(self):
        cleaned_data = super().clean()
        student = cleaned_data.get('student')
        course = cleaned_data.get('course')
        if student and course:
            qs = Certificate.objects.filter(student=student, course=course)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise forms.ValidationError('A certificate has already been issued for this student and course.')
        return cleaned_data
