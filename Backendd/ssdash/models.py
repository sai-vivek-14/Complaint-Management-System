from django.db import models

class Complaint(models.Model):
    # Status choices for the complaint
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Resolved', 'Resolved'),
        ('In Progress', 'In Progress'),
    ]

    # Category choices for the complaint
    CATEGORY_CHOICES = [
        ('Electrical', 'Electrical'),
        ('Plumbing', 'Plumbing'),
        ('Carpenting', 'Carpenting'),
        ('Water Filter', 'Water Filter'),
        ('Bathroom Clogging', 'Bathroom Clogging'),
    ]

    # Fields for the Complaint model
    objects = models.Manager() # The default manager
    complaint_name = models.CharField(max_length=255)  # Name of the complaint
    description = models.TextField()  # Detailed description of the complaint
    room_number = models.CharField(max_length=50)  # Room number where the complaint is raised
    complaint_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)  # Category of the complaint
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')  # Status of the complaint
    place = models.CharField(max_length=255)  # Place or location of the complaint
    attachment = models.FileField(upload_to='complaints/', null=True, blank=True)  # File attachment for complaint evidence
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the complaint was created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp when the complaint was last updated

    def __str__(self):
        return f"{self.complaint_name} - {self.status}"  # String representation of the complaint