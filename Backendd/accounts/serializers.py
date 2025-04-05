from rest_framework import serializers

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import Hostel, Room, StudentProfile, WorkerProfile, Complaint, ComplaintType
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        credentials = {
            'username': attrs.get("username"),
            'password': attrs.get("password")
        }
        
        user = authenticate(**credentials)
        if user:
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            
            data = super().validate(attrs)
            data['user_type'] = user.user_type
            data['email'] = user.email
            data['roll_number'] = user.roll_number
            return data
        raise serializers.ValidationError("Unable to log in with provided credentials.")

from rest_framework import serializers
from django.contrib.auth.models import User

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    Roll_number = serializers.SerializerMethodField()
    Phone_number = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    user_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 
                'Roll_number', 'Phone_number', 'profile_photo', 'user_type']

    def get_Roll_number(self, obj):
        return getattr(obj.userprofile, 'roll_number', None)

    def get_Phone_number(self, obj):
        return getattr(obj.userprofile, 'phone_number', None)

    def get_user_type(self, obj):
        return getattr(obj.userprofile, 'user_type', None)

    def get_profile_photo(self, obj):
        if hasattr(obj, 'userprofile') and obj.userprofile.profile_photo:
            return self.context['request'].build_absolute_uri(obj.userprofile.profile_photo.url)
        return None
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'roll_number', 'first_name', 'last_name', 
                 'user_type', 'hostel', 'password', 'confirm_password']
        
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
            
        if data['user_type'] == 'student' and not data.get('roll_number'):
            raise serializers.ValidationError("Roll number is required for students")
            
        return data
        
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        if validated_data['user_type'] == 'student':
            StudentProfile.objects.create(user=user)
        elif validated_data['user_type'] == 'worker':
            WorkerProfile.objects.create(user=user)
            
        return user

class HostelSerializer(serializers.ModelSerializer):
    current_occupancy = serializers.ReadOnlyField()
    available_space = serializers.ReadOnlyField()
    
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'location', 'capacity', 'warden', 'current_occupancy', 'available_space']
        extra_kwargs = {
            'warden': {'required': False}
        }

class RoomSerializer(serializers.ModelSerializer):
    occupants_count = serializers.SerializerMethodField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'hostel', 'capacity', 'occupants_count', 'is_full']
    
    def get_occupants_count(self, obj):
        return obj.occupants.count()

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    room_details = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'room', 'room_details', 'year_of_study', 'department', 'emergency_contact']
    
    def get_room_details(self, obj):
        if obj.room:
            return {
                'room_number': obj.room.room_number,
                'hostel_name': obj.room.hostel.name
            }
        return None

class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    complaint_types = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=ComplaintType.objects.all()
    )
    
    class Meta:
        model = WorkerProfile
        fields = ['id', 'user', 'worker_type', 'complaint_types', 'shift', 'is_available']

class ComplaintTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintType
        fields = ['id', 'name', 'description']

class ComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    complaint_type_name = serializers.SerializerMethodField()
    assigned_worker_name = serializers.SerializerMethodField()
    hostel_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ['id', 'student', 'student_name', 'complaint_type', 'complaint_type_name', 
                 'description', 'status', 'assigned_worker', 'assigned_worker_name', 
                 'created_at', 'hostel_name']
        read_only_fields = ['student', 'created_at']
    
    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}" if obj.student else ""
    
    def get_complaint_type_name(self, obj):
        return obj.complaint_type.name if obj.complaint_type else ""
    
    def get_assigned_worker_name(self, obj):
        return f"{obj.assigned_worker.first_name} {obj.assigned_worker.last_name}" if obj.assigned_worker else ""
    
    def get_hostel_name(self, obj):
        return obj.student.hostel.name if obj.student and obj.student.hostel else ""

class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['complaint_type', 'description']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['student'] = request.user
        return super().create(validated_data)