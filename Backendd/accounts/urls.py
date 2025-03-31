from django.urls import path
from .views import LoginAPIView, EnhancedPasswordResetAPIView, PasswordResetConfirmAPIView
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm

urlpatterns = [
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/password_reset/', EnhancedPasswordResetAPIView.as_view(), name='api-password-reset'),
    path('api/auth/password_reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='api-password-reset-confirm'),
    
    # Traditional password reset URLs (optional if you want to keep Django's built-in templates)
    path('password_reset/', auth_views.PasswordResetView.as_view(
        form_class=CustomPasswordResetForm,
        template_name='accounts/password_reset_form.html',  # Add this template if needed
        email_template_name='accounts/password_reset.html',  # Changed to match existing file
        subject_template_name='accounts/password_reset_subject.txt',  # Create this file
        from_email='hostcomplaints@gmail.com',
    ), name='password_reset'),
]