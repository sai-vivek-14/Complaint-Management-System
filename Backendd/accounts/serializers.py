# 1. Update serializers.py to handle roll number-based reset
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class PasswordResetSerializer(serializers.Serializer):
    """
    Enhanced password reset serializer that accepts either email or roll number
    """
    identifier = serializers.CharField(required=True)

    def validate_identifier(self, value):
        # Check if identifier is an email or roll number
        if '@' in value:
            # Email format validation
            if not value.endswith('@iiitkottayam.ac.in'):
                raise serializers.ValidationError("Please use your institute email address")
            
            # Check if user exists with this email
            if not User.objects.filter(email=value).exists():
                raise serializers.ValidationError("No account found with this email address")
            
            return {'type': 'email', 'value': value}
        else:
            # Roll number format validation
            import re
            if not re.match(r'^(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\d{4}$', value):
                raise serializers.ValidationError("Invalid roll number format")
            
            # Check if user exists with this roll number
            if not User.objects.filter(roll_number=value).exists():
                raise serializers.ValidationError("No account found with this roll number")
            
            # Get the linked email for this roll number
            user = User.objects.get(roll_number=value)
            return {'type': 'roll_number', 'value': value, 'email': user.email}
class LoginSerializer(serializers.Serializer):
    email_or_roll = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email_or_roll'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid login credentials.")
        return {'user': user}


# 2. Update the views.py for enhanced password reset
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
import logging

logger = logging.getLogger(__name__)

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
        email_template = 'accounts/password_reset_email.html'
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