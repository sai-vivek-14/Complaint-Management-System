from django.core.mail import send_mail
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backendd.settings")  # Ensure the correct path
django.setup()


send_mail(
    subject='Test Email',
    message='This is a test email from Insta Solve.',
    from_email='hostcomplaints@gmail.com',
    recipient_list=['saivivek1357@gmail.com'],
    fail_silently=False,
)