from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, EmailValidator

class Hostel(models.Model):
    """Model representing a hostel building"""
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def current_occupancy(self):
        return self.residents.count()
    
    @property
    def available_space(self):
        return max(0, self.capacity - self.current_occupancy)

class Room(models.Model):
    """Model representing a room within a hostel"""
    room_number = models.CharField(max_length=10)
    hostel = models.ForeignKey(
        Hostel, 
        on_delete=models.CASCADE, 
        related_name='rooms'
    )
    capacity = models.PositiveSmallIntegerField(default=2)
    
    class Meta:
        unique_together = ('hostel', 'room_number')
        ordering = ['hostel', 'room_number']
    
    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"
    
    @property
    def current_occupants(self):
        return self.student_profiles.count()
    
    @property
    def is_full(self):
        return self.current_occupants >= self.capacity

class ComplaintType(models.Model):
    """Model for different types of complaints"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    response_time = models.DurationField(
        help_text="Expected time to resolve this complaint type"
    )
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    class UserType(models.TextChoices):
        STUDENT = 'student', 'Student'
        WARDEN = 'warden', 'Warden'
        STAFF = 'staff', 'Hostel Staff'
        WORKER = 'worker', 'Maintenance Worker'
        ADMIN = 'admin', 'Administrator'
    
    # Core Fields
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.STUDENT
    )
    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(),
            RegexValidator(
                regex=r'^[a-zA-Z0-9._%+-]+@iiitkottayam\.ac\.in$',
                message="Must be a valid @iiitkottayam.ac.in address"
            )
        ]
    )
    
    # Student-specific fields
    roll_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^(202[1-4])(bcs|bcd|bcy|bec)\d{4}$',
                message="Format: YYYYgroupXXXX (e.g., 2023bcy0037)"
            )
        ]
    )
    
    # Contact Information
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be in international format"
            )
        ]
    )
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    
    # Profile Information
    profile_photo = models.ImageField(
        upload_to='profile_photos/',
        blank=True,
        null=True
    )
    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='residents'
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='occupants'
    )
    
    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        if self.user_type == self.UserType.STUDENT and self.roll_number:
            return f"{self.roll_number} - {self.get_full_name()}"
        return f"{self.get_full_name()} ({self.get_user_type_display()})"
    
    def save(self, *args, **kwargs):
        # Clean fields before saving
        if self.phone_number:
            self.phone_number = ''.join(c for c in self.phone_number if c.isdigit())
        super().save(*args, **kwargs)

class StudentProfile(models.Model):
    """Extended profile for students"""
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='student_profile',
        limit_choices_to={'user_type': CustomUser.UserType.STUDENT}
    )
    department = models.CharField(max_length=100)
    year_of_study = models.PositiveSmallIntegerField()
    is_resident = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Student Profile'
    
    def __str__(self):
        return f"Student Profile: {self.user.roll_number}"

class WorkerProfile(models.Model):
    """Extended profile for maintenance workers"""
    class WorkerType(models.TextChoices):
        PLUMBER = 'plumbing', 'Plumbing'
        ELECTRICIAN = 'electrical', 'Electrical'
        CARPENTER = 'carpentry', 'Carpentry'
        CLEANER = 'cleaning', 'Cleaning'
        IT_SUPPORT = 'it_support', 'IT Support'
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='worker_profile',
        limit_choices_to={'user_type': CustomUser.UserType.WORKER}
    )
    worker_type = models.CharField(
        max_length=20,
        choices=WorkerType.choices
    )
    complaint_types = models.ManyToManyField(
        ComplaintType,
        related_name='workers'
    )
    shift = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Worker Profile'
    
    def __str__(self):
        return f"{self.get_worker_type_display()}: {self.user.get_full_name()}"

class Complaint(models.Model):
    """Model for tracking complaints"""
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ASSIGNED = 'assigned', 'Assigned'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        REJECTED = 'rejected', 'Rejected'
    
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': CustomUser.UserType.STUDENT},
        related_name='filed_complaints'
    )
    complaint_type = models.ForeignKey(
        ComplaintType,
        on_delete=models.PROTECT,
        related_name='complaints'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    assigned_to = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': CustomUser.UserType.WORKER},
        related_name='assigned_complaints'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolution_details = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint'
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
    @property
    def is_open(self):
        return self.status not in [self.Status.RESOLVED, self.Status.REJECTED]