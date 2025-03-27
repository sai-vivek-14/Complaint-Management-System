# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\d{4}$',
                message="Roll number must be in format: YYYYgroupXXXX"
            )
        ]
    )
    email = models.EmailField(blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(self.username)
    