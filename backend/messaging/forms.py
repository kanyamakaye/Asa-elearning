from django import forms

from .models import Message


class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['receiver', 'subject', 'message_body', 'attachment']
        widgets = {'message_body': forms.Textarea(attrs={'rows': 4})}

    def __init__(self, *args, sender=None, **kwargs):
        self.sender = sender
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        if self.sender and cleaned_data.get('receiver') == self.sender:
            raise forms.ValidationError('You cannot send a message to yourself.')
        return cleaned_data
