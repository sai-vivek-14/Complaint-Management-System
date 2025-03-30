from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, EmailValidator

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('warden', 'Warden'),
        ('hostel_staff', 'Hostel Staff'),
        ('worker', 'Worker'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    roll_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\d{4}$',
                message="Roll number must be in format: YYYYgroupXXXX"
            )
        ]
    )
    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(),
            RegexValidator(
                regex=r'^[a-zA-Z0-9._%+-]+@iiitkottayam\.ac\.in$',
                message="Email must be a valid @iiitkottayam.ac.in address"
            )
        ]
    )
    hostel = models.ForeignKey('Hostel', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        if self.user_type == 'student':
            return f"{self.roll_number or 'Unknown Roll Number'} (Student)"
        return f"{self.email or 'Unknown Email'} ({self.get_user_type_display()})"

class Hostel(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    warden = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='warden_of')

    def __str__(self):
        return self.name