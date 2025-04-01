from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
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

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'roll_number', 'user_type', 'hostel')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].initial = '@iiitkottayam.ac.in'

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
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
    inlines = [WorkerProfileInline]

    def save_model(self, request, obj, form, change):
        created = not obj.pk  # Check if this is a new user
        super().save_model(request, obj, form, change)
        
        if created:
            if obj.user_type == 'student' and not hasattr(obj, 'student_profile'):
                StudentProfile.objects.create(
                    user=obj,
                    year_of_study=1,
                    department='Computer Science'
                )
            elif obj.user_type == 'worker' and not hasattr(obj, 'worker_profile'):
                worker_profile = WorkerProfile.objects.create(
                    user=obj,
                    worker_type='maintenance',
                    is_available=True
                )
                default_complaint_type = ComplaintType.objects.filter(name='General').first()
                if default_complaint_type:
                    worker_profile.complaint_types.add(default_complaint_type)

class HostelAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'warden')
    list_filter = ('warden',)
    search_fields = ('name', 'location')
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not obj:
            form.base_fields['capacity'].initial = 100
            form.base_fields['location'].initial = 'IIIT Kottayam Campus'
        return form

class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'hostel', 'capacity', 'is_full')
    list_filter = ('hostel', 'capacity')
    search_fields = ('room_number', 'hostel__name')
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not obj:
            form.base_fields['capacity'].initial = 2
        return form

class ComplaintAdminForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not kwargs.get('instance'):
            self.initial['status'] = 'pending'

class ComplaintAdmin(admin.ModelAdmin):
    form = ComplaintAdminForm
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
admin.site.register(Room, RoomAdmin)
admin.site.register(StudentProfile)
admin.site.register(ComplaintType, ComplaintTypeAdmin)
admin.site.register(WorkerProfile)
admin.site.register(Complaint, ComplaintAdmin)