from django.urls import path
from .views import LoginAPIView
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm

urlpatterns = [
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    
    # Password reset URLs
    path('accounts/password_reset/', auth_views.PasswordResetView.as_view(
        form_class=CustomPasswordResetForm,
        template_name='accounts/password_reset.html',
        email_template_name='accounts/password_reset_email.html',
        subject_template_name='accounts/password_reset_subject.txt',
        from_email='complaints@gmail.com',
    ), name='password_reset'),
    # ... other password reset URLs ...
]