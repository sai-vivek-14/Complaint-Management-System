# ssdash/admin.py
from django.contrib import admin
from .models import Complaint  # Import the Complaint model

# Register the Complaint model
admin.site.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('complaint_name', 'get_roll_number', 'status', 'room_number')
    list_filter = ('status', 'complaint_category')
    
    def get_roll_number(self, obj):
        return obj.user.roll_number
    get_roll_number.short_description = 'Roll Number'
    get_roll_number.admin_order_field = 'user__roll_number'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.user_type == 'student':
            return qs.filter(user=request.user)
        return qs