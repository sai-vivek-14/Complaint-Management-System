# accounts/forms.py
from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.forms import PasswordResetForm
from .models import CustomUser

class RollNumberLoginForm(AuthenticationForm):
    username = forms.CharField(
        label="Roll Number",
        widget=forms.TextInput(attrs={
            'placeholder': 'YYYYgroupXXXX',
            'pattern': '(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\\d{4}',
            'title': 'Format: YYYYgroupXXXX (e.g., 2024bcs1234)'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )

class RollNumberPasswordResetForm(PasswordResetForm):
    def get_users(self, email):
        # Treat the "email" field as roll number
        return CustomUser.objects.filter(username__iexact=email)