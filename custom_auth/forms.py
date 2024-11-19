# FILE: custom_auth/forms.py
from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from allauth.account.forms import SignupForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')

class CustomSignupForm(SignupForm):
    phone_number = forms.CharField(max_length=15, required=False, label='Phone Number (optional)')

    def save(self, request):
        user = super(CustomSignupForm, self).save(request)
        user.phone_number = self.cleaned_data['phone_number']
        user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')

    def __init__(self, *args, **kwargs):
        super(CustomUserChangeForm, self).__init__(*args, **kwargs)
        self.fields.pop('password', None)
        self.fields['username'].help_text = 'Enter your desired username. (required)'
        self.fields['first_name'].help_text = 'Enter your first name. (optional but recomended for bookings)'
        self.fields['last_name'].help_text = 'Enter your last name. (optional but recomended for bookings)'
        self.fields['email'].help_text = 'Enter your email address. (optional but recomended)'
        self.fields['phone_number'].help_text = 'Enter your phone number. (optional but required for bookings)'