from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.conf import settings
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
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

class PasswordResetAPIView(APIView):
    """
    Initiates password reset process
    Sends email with reset link to React frontend
    """
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate reset token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(str(user.pk).encode())
        
        # Build reset link that redirects to React frontend
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?uid={uid}&token={token}"
        
        # Send email
        user.email_user(
            subject="Password Reset Request",
            message=f"Click here to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL
        )
        
        return Response({"detail": "Password reset email sent"})

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