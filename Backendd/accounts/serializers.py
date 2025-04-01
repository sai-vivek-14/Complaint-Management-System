from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hostel, Room, StudentProfile, WorkerProfile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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

class UserSerializer(serializers.ModelSerializer):
    student_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    worker_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'roll_number', 'first_name', 'last_name', 
                  'user_type', 'hostel', 'phone_number', 'profile_photo', 
                  'student_profile', 'worker_profile']
        read_only_fields = ['id', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
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
        fields = ['id', 'name', 'location', 'capacity', 'current_occupancy', 'available_space']

class RoomSerializer(serializers.ModelSerializer):
    occupants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'hostel', 'capacity', 'occupants_count', 'is_full']
    
    def get_occupants_count(self, obj):
        return obj.occupants.count()

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'room', 'year_of_study', 'department', 'emergency_contact']

class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = ['id', 'user', 'worker_type', 'assigned_hostel', 'shift']