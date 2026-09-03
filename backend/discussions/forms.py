from django import forms

from .models import DiscussionReply, DiscussionTopic


class DiscussionTopicForm(forms.ModelForm):
    class Meta:
        model = DiscussionTopic
        fields = ['course', 'title', 'description', 'is_pinned', 'is_locked', 'status']
        widgets = {'description': forms.Textarea(attrs={'rows': 4})}


class DiscussionReplyForm(forms.ModelForm):
    class Meta:
        model = DiscussionReply
        fields = ['topic', 'reply_text', 'parent_reply']
        widgets = {'reply_text': forms.Textarea(attrs={'rows': 3})}

    def clean(self):
        cleaned_data = super().clean()
        topic = cleaned_data.get('topic')
        if topic and topic.is_locked:
            raise forms.ValidationError('This discussion topic is locked.')
        return cleaned_data
