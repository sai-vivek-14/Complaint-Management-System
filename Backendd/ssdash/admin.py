# ssdash/admin.py
from django.contrib import admin
from .models import Complaint  # Import the Complaint model

# Register the Complaint model
admin.site.register(Complaint)