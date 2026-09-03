from django import forms

from .models import FAQ, Feedback, SupportTicket


class SupportTicketForm(forms.ModelForm):
    class Meta:
        model = SupportTicket
        fields = ['subject', 'description', 'category', 'priority']
        widgets = {'description': forms.Textarea(attrs={'rows': 5})}


class SupportTicketStatusForm(forms.ModelForm):
    class Meta:
        model = SupportTicket
        fields = ['status', 'assigned_to', 'priority']


class FAQForm(forms.ModelForm):
    class Meta:
        model = FAQ
        fields = ['question', 'answer', 'category', 'display_order', 'is_active']
        widgets = {'answer': forms.Textarea(attrs={'rows': 4})}


class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = ['feedback_type', 'subject', 'message', 'rating']
        widgets = {'message': forms.Textarea(attrs={'rows': 4})}
