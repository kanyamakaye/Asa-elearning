from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from .models import InstructorProfile, Role, StudentProfile

User = get_user_model()


class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, validators=[validate_password])
    password_confirm = forms.CharField(widget=forms.PasswordInput, label='Confirm password')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'middle_name', 'last_name', 'phone_number', 'user_type',
        ]

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('password') != cleaned_data.get('password_confirm'):
            self.add_error('password_confirm', 'Passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            if user.user_type == User.UserType.STUDENT:
                StudentProfile.objects.get_or_create(user=user)
            elif user.user_type == User.UserType.INSTRUCTOR:
                InstructorProfile.objects.get_or_create(user=user)
        return user


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 'phone_number', 'profile_picture',
            'gender', 'date_of_birth', 'address', 'country', 'city',
        ]
        widgets = {'date_of_birth': forms.DateInput(attrs={'type': 'date'})}


class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = StudentProfile
        fields = [
            'institution_name', 'department', 'program', 'academic_level',
            'admission_date', 'expected_completion_date', 'biography',
        ]
        widgets = {
            'admission_date': forms.DateInput(attrs={'type': 'date'}),
            'expected_completion_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        admission = cleaned_data.get('admission_date')
        expected = cleaned_data.get('expected_completion_date')
        if admission and expected and expected < admission:
            self.add_error('expected_completion_date', 'Must be after the admission date.')
        return cleaned_data


class InstructorProfileForm(forms.ModelForm):
    class Meta:
        model = InstructorProfile
        fields = ['qualification', 'specialization', 'department', 'biography', 'years_of_experience']


class ChangePasswordForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput)
    new_password = forms.CharField(widget=forms.PasswordInput, validators=[validate_password])
    new_password_confirm = forms.CharField(widget=forms.PasswordInput, label='Confirm new password')

    def __init__(self, *args, user=None, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_old_password(self):
        value = self.cleaned_data['old_password']
        if self.user and not self.user.check_password(value):
            raise forms.ValidationError('Old password is incorrect.')
        return value

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('new_password') != cleaned_data.get('new_password_confirm'):
            self.add_error('new_password_confirm', 'Passwords do not match.')
        return cleaned_data


class RoleForm(forms.ModelForm):
    class Meta:
        model = Role
        fields = ['name', 'description', 'is_active']
