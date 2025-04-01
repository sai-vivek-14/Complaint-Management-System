from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, EmailValidator

class ComplaintType(models.Model):
    name = models.CharField(max_length=50)  # e.g., "Plumbing", "Electrical"
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Hostel(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=0)
    warden = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'warden'},
        related_name='warden_of_hostel'  # Fixed related name
    )
    
    def __str__(self):
        return str(self.name)
    
    @property
    def current_occupancy(self):
        return self.residents.count()
    
    @property
    def available_space(self):
        return self.capacity - self.current_occupancy

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
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    hostel = models.ForeignKey(
        Hostel, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='residents'
    )

    def __str__(self):
        full_name = self.get_full_name().strip()
        
        if self.user_type == 'student':
            return f"{self.roll_number} ({full_name or self.username})"
        
        # For wardens and other user types, include email if name is empty
        if not full_name:
            return f"{self.username or self.email} ({self.get_user_type_display()})"
        
        return f"{full_name} ({self.get_user_type_display()})"

class Room(models.Model):
    room_number = models.CharField(max_length=10)
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    capacity = models.PositiveSmallIntegerField(default=2)
    
    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"
    
    @property
    def occupants(self):
        return self.student_profiles.all()
    
    @property
    def is_full(self):
        return self.occupants.count() >= self.capacity

class StudentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='student_profile',
        limit_choices_to={'user_type': 'student'}
    )
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profiles')
    year_of_study = models.PositiveSmallIntegerField()
    department = models.CharField(max_length=100)
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"Profile for {self.user.roll_number}"

class WorkerProfile(models.Model):
    WORKER_TYPE_CHOICES = (
    ('cleaning', 'Cleaning Staff'),
    ('itsupport', 'IT Support Staff')
)

    
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='worker_profile',
        limit_choices_to={'user_type': 'worker'}
    )
    worker_type = models.CharField(max_length=20, choices=WORKER_TYPE_CHOICES)
    complaint_types = models.ManyToManyField(ComplaintType)
    shift = models.CharField(max_length=50, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_worker_type_display()}"

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('resolved', 'Resolved')
    ]
    
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'student'},
        related_name='filed_complaints'  # Add this line
    )
    complaint_type = models.ForeignKey(ComplaintType, on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_worker = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'worker', 'worker_profile__complaint_types': models.F('complaint_type')},
        related_name='assigned_complaints'  # Add this line
    )
    created_at = models.DateTimeField(auto_now_add=True)