from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
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

class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset with token
    """
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        # Validate passwords match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        
        # Validate token and uid
        try:
            uid = urlsafe_base64_decode(data['uid']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid user ID"})
        
        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({"token": "Invalid or expired token"})
            
        data['user'] = user
        return data