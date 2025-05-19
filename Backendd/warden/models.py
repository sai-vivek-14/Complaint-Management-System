from django.db import models
from accounts.models import CustomUser, Hostel

class WardenProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'warden'},
        related_name='warden_profile'
    )
    hostel = models.OneToOneField(Hostel, on_delete=models.CASCADE)

    def __str__(self):
        return f"Warden: {self.user.email if self.user else 'No Email'}"
