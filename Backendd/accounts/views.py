from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.conf import settings
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.html import strip_tags
from .serializers import (
    LoginSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class LoginAPIView(APIView):
    """
    Handles student (roll number) and staff (email) login
    Returns JWT tokens on successful authentication
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        user = data['user']  # The user is already validated in the serializer
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_type': user.user_type,
            'first_name': user.first_name,
            'last_name': user.last_name
        })

class EnhancedPasswordResetAPIView(APIView):
    """
    Enhanced password reset that works with both roll number and email
    """
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Get the user based on identifier type
        if data['type'] == 'email':
            user = User.objects.get(email=data['value'])
        else:  # roll_number
            user = User.objects.get(roll_number=data['value'])
            
        # Generate reset token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build reset link that redirects to React frontend
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?uid={uid}&token={token}"
        
        # Prepare email context
        context = {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'Insta Solve - IIIT Kottayam',
            'domain': settings.BACKEND_DOMAIN.replace('http://', '').replace('https://', ''),
            'protocol': 'https' if request.is_secure() else 'http',
        }
        
        # Create email content
        subject = 'Password Reset Request - Insta Solve'
        email_template = 'accounts/password_reset.html'  # Changed from password_reset_email.html
        html_message = render_to_string(email_template, context)
        plain_message = strip_tags(html_message)  # Create plain text version
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Password reset email sent to {user.email}")
            return Response({"detail": "Password reset email sent"})
        
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return Response(
                {"detail": "Failed to send reset email. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmAPIView(APIView):
    """
    Handles password reset confirmation
    Validates token and sets new password
    """
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        user = data['user']
        user.set_password(data['new_password'])
        user.save()
        
        return Response({"detail": "Password reset successful"})