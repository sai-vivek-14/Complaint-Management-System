from django.contrib.auth.forms import PasswordResetForm
from django.core.validators import EmailValidator, RegexValidator
from django import forms
from .models import CustomUser

class CustomPasswordResetForm(PasswordResetForm):
    email = forms.CharField(label="Email or Roll Number")

    def get_users(self, email):
        # Try email first
        users = super().get_users(email)
        if users:
            return users
        
        # Then try roll number
        return CustomUser.objects.filter(roll_number__iexact=email)
# Add the class to __all__ for explicit export
__all__ = ["CustomPasswordResetForm"]