from django.urls import path
from .views import LoginAPIView, PasswordResetAPIView, PasswordResetConfirmAPIView
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm

urlpatterns = [
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/password_reset/', PasswordResetAPIView.as_view(), name='api-password-reset'),
    path('api/auth/password_reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='api-password-reset-confirm'),
    
    # Traditional password reset URLs (optional if you want to keep Django's built-in templates)
    path('password_reset/', auth_views.PasswordResetView.as_view(
        form_class=CustomPasswordResetForm,
        template_name='accounts/password_reset.html',
        email_template_name='accounts/password_reset_email.html',
        subject_template_name='accounts/password_reset_subject.txt',
        from_email='hostcomplaints@gmail.com',
    ), name='password_reset'),
]