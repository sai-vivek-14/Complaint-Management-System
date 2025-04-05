from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Hostel, Room, StudentProfile, WorkerProfile, Complaint, ComplaintType
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer


from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    HostelSerializer,
    RoomSerializer,
    StudentProfileSerializer,
    WorkerProfileSerializer,
    CustomTokenObtainPairSerializer,
    ComplaintSerializer,
    ComplaintTypeSerializer
)
from django.urls import reverse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string

# Get the custom user model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
User = get_user_model()
class LoginAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'user_type': user.user_type  # Assuming your CustomUser has user_type field
            })
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class IsWardenOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or 
            request.user.user_type == 'warden'
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsWardenOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = User.objects.all()
        user_type = self.request.query_params.get('user_type')
        hostel_id = self.request.query_params.get('hostel')
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        if hostel_id:
            queryset = queryset.filter(hostel_id=hostel_id)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def students(self, request):
        students = User.objects.filter(user_type='student')
        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def wardens(self, request):
        wardens = User.objects.filter(user_type='warden')
        serializer = self.get_serializer(wardens, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def workers(self, request):
        workers = User.objects.filter(user_type='worker')
        serializer = self.get_serializer(workers, many=True)
        return Response(serializer.data)

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsWardenOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        hostel = self.get_object()
        students = hostel.residents.filter(user_type='student')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        hostel = self.get_object()
        rooms = hostel.rooms.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsWardenOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def occupants(self, request, pk=None):
        room = self.get_object()
        occupants = User.objects.filter(student_profile__room=room)
        serializer = UserSerializer(occupants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_student(self, request, pk=None):
        room = self.get_object()
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({"error": "Student ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = User.objects.get(id=student_id, user_type='student')
        except User.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if room.is_full:
            return Response({"error": "Room is already full"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile, created = StudentProfile.objects.get_or_create(user=student)
        profile.room = room
        profile.save()
        
        student.hostel = room.hostel
        student.save()
        
        return Response({"success": "Student assigned to room successfully"})

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PasswordResetRequestView(APIView):
    def post(self, request):
        email_or_roll = request.data.get('email_or_roll')
        
        try:
            if '@' in email_or_roll:
                user = User.objects.get(email=email_or_roll)
            else:
                user = User.objects.get(roll_number=email_or_roll)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email/roll number does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build reset URL with query parameters
        reset_url = f"http://localhost:5173/reset?uid={uid}&token={token}"
        
        # Send email
        subject = 'Password Reset Request'
        message = render_to_string('accounts/password_reset_email.html', {
    'user': user,
    'reset_url': reset_url,
})
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response(
            {'success': 'Password reset email sent'},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        
        if password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response(
                {'success': 'Password has been reset successfully'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid token or user'},
                status=status.HTTP_400_BAD_REQUEST
            )

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.user_type == 'student':
            return queryset.filter(student=user)
        elif user.user_type == 'worker':
            return queryset.filter(assigned_worker=user)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def assign_worker(self, request, pk=None):
        complaint = self.get_object()
        worker_id = request.data.get('worker_id')
        
        if not worker_id:
            return Response({"error": "Worker ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            worker = User.objects.get(
                id=worker_id, 
                user_type='worker',
                worker_profile__complaint_types=complaint.complaint_type,
                worker_profile__is_available=True
            )
        except User.DoesNotExist:
            return Response(
                {"error": "No available worker found with this ID that can handle this complaint type"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        complaint.assigned_worker = worker
        complaint.status = 'assigned'
        complaint.save()
        
        return Response({"success": "Worker assigned to complaint successfully"})
    
    @action(detail=True, methods=['get'])
    def available_workers(self, request, pk=None):
        complaint = self.get_object()
        available_workers = User.objects.filter(
            user_type='worker',
            worker_profile__complaint_types=complaint.complaint_type,
            worker_profile__is_available=True
        )
        serializer = UserSerializer(available_workers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_resolved(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = 'resolved'
        complaint.save()
        return Response({"success": "Complaint marked as resolved"})

class ComplaintTypeViewSet(viewsets.ModelViewSet):
    queryset = ComplaintType.objects.all()
    serializer_class = ComplaintTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsWardenOrAdmin]