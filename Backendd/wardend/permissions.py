from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse

class WardenRequiredMixin(UserPassesTestMixin):
    """
    Mixin to restrict access to views only to wardens.
    """
    login_url = 'login'
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.user_type == 'warden'
    
    def handle_no_permission(self):
        messages.error(self.request, "You don't have permission to access this page. Warden access only.")
        return redirect(reverse('login'))
