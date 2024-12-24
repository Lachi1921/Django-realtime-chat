from django import forms
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from .models import *


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

class GroupForm(forms.ModelForm):
    members = forms.ModelMultipleChoiceField(queryset=User.objects.all(), widget=forms.CheckboxSelectMultiple)
    class Meta:
        model = Group
        fields = ['avatar', 'name', 'description', 'members']

class UserAndProfileForm(forms.ModelForm):
    first_name = forms.CharField(
        label='First Name', max_length=150, required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First name'})
    )
    last_name = forms.CharField(
        label='Last Name', max_length=150, required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last name'})
    )
    email = forms.EmailField(
        label='Email', required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'})
    )
    country = forms.CharField(
        label='Country', max_length=150, required=True, 
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Country'})
    )
    phone = forms.CharField(
        label='Phone', max_length=10, required=True, 
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone'})
    )
    bio = forms.CharField(
        label='Bio', widget=forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Bio'})
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        if self.instance and hasattr(self.instance, 'profile'):
            profile = self.instance.profile
            for field_name in ['country', 'phone', 'bio']:
                self.fields[field_name].initial = getattr(profile, field_name, None)

        if self.instance:
            for field_name in ['first_name', 'last_name', 'email']:
                self.fields[field_name].initial = getattr(self.instance, field_name, None)

class SocialsForm(forms.ModelForm):
    twitter = forms.CharField(
        label='Twitter', max_length=150, required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Twitter'})
    )
    facebook = forms.CharField(
        label='Facebook', max_length=150, required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Facebook'})
    )
    instagram = forms.EmailField(
        label='Instagram', required=False,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Instagram'})
    )

    class Meta:
        model = Social
        fields = ['twitter', 'facebook', 'instagram']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        if self.instance:
            for field_name in ['twitter', 'facebook', 'instagram']:
                self.fields[field_name].initial = getattr(self.instance, field_name, None)

class NotificationPreferenceForm(forms.ModelForm):
    class Meta:
        model = NotificationSetting
        fields = ['message_notification', 'browser_notification']