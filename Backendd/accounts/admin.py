from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (CustomUser, Hostel, Room, 
                    StudentProfile, WorkerProfile,
                    ComplaintType, Complaint)

class ComplaintTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class WorkerProfileInline(admin.StackedInline):
    model = WorkerProfile
    filter_horizontal = ('complaint_types',)
    extra = 0

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'roll_number', 'user_type', 'hostel', 'is_staff')
    list_filter = ('user_type', 'hostel', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'roll_number', 'phone_number', 'profile_photo')}),
        ('Permissions', {'fields': ('user_type', 'hostel', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'roll_number', 'user_type', 'hostel', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'roll_number', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [WorkerProfileInline] if WorkerProfileInline.model else []

class HostelAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'warden')
    list_filter = ('warden',)
    search_fields = ('name', 'location')

class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'complaint_type', 'status', 'assigned_worker', 'created_at')
    list_filter = ('complaint_type', 'status')
    search_fields = ('student__username', 'description')
    raw_id_fields = ('assigned_worker',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "assigned_worker":
            complaint_id = request.resolver_match.kwargs.get('object_id')
            if complaint_id:
                complaint = Complaint.objects.get(id=complaint_id)
                kwargs["queryset"] = CustomUser.objects.filter(
                    user_type='worker',
                    worker_profile__complaint_types=complaint.complaint_type,
                    worker_profile__is_available=True
                )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Hostel, HostelAdmin)
admin.site.register(Room)
admin.site.register(StudentProfile)
admin.site.register(ComplaintType, ComplaintTypeAdmin)
admin.site.register(WorkerProfile)
admin.site.register(Complaint, ComplaintAdmin)