# accounts/views.py
from django.contrib.auth.views import LoginView
from .forms import RollNumberLoginForm

class CustomLoginView(LoginView):
    authentication_form = RollNumberLoginForm
    template_name = 'accounts/login.html'