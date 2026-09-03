from django import forms

from .models import Announcement, Notification


class AnnouncementForm(forms.ModelForm):
    class Meta:
        model = Announcement
        fields = ['course', 'title', 'message', 'audience_type', 'publish_date', 'expiry_date', 'status']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4}),
            'publish_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'expiry_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('audience_type') == Announcement.Audience.COURSE and not cleaned_data.get('course'):
            self.add_error('course', 'Required when audience is a specific course.')
        publish = cleaned_data.get('publish_date')
        expiry = cleaned_data.get('expiry_date')
        if publish and expiry and expiry <= publish:
            self.add_error('expiry_date', 'Must be after the publish date.')
        return cleaned_data


class NotificationForm(forms.ModelForm):
    class Meta:
        model = Notification
        fields = ['user', 'notification_type', 'title', 'message', 'reference_type', 'reference_id']
