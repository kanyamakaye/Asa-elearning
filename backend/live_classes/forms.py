from django import forms

from .models import Attendance, LiveSession


class LiveSessionForm(forms.ModelForm):
    class Meta:
        model = LiveSession
        fields = [
            'course', 'title', 'description', 'meeting_platform', 'meeting_url', 'meeting_id',
            'meeting_password', 'scheduled_date', 'start_time', 'end_time', 'timezone', 'capacity',
            'status', 'recording_url',
        ]
        widgets = {
            'scheduled_date': forms.DateInput(attrs={'type': 'date'}),
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


class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['course', 'student', 'session', 'attendance_status', 'remarks']
