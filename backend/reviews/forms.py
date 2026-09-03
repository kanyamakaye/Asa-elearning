from django import forms

from enrollments.models import Enrollment

from .models import CourseReview, Wishlist


class CourseReviewForm(forms.ModelForm):
    class Meta:
        model = CourseReview
        fields = ['course', 'rating', 'review_text']
        widgets = {'review_text': forms.Textarea(attrs={'rows': 4})}

    def __init__(self, *args, student=None, **kwargs):
        self.student = student
        super().__init__(*args, **kwargs)

    def clean_course(self):
        course = self.cleaned_data['course']
        if self.student and not Enrollment.objects.filter(student=self.student, course=course).exists():
            raise forms.ValidationError('You must be enrolled in this course to leave a review.')
        return course


class WishlistForm(forms.ModelForm):
    class Meta:
        model = Wishlist
        fields = ['course']
