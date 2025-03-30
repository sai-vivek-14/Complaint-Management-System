from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.validators import RegexValidator

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    login_type = serializers.ChoiceField(choices=['student', 'staff'])
    identifier = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = None
        
        if data['login_type'] == 'student':
            # Validate roll number format
            validator = RegexValidator(
                regex=r'^(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\d{4}$',
                message="Invalid roll number format"
            )
            try:
                validator(data['identifier'])
            except:
                raise serializers.ValidationError({
                    'identifier': 'Roll number must be in format: YYYYgroupXXXX'
                })
            
            user = authenticate(
                username=data['identifier'],
                password=data['password']
            )
            
            if not user or user.user_type != 'student':
                raise serializers.ValidationError("Invalid roll number or password")
        else:
            # Staff login with email
            user = authenticate(
                username=data['identifier'],
                password=data['password']
            )
            
            if not user or user.user_type == 'student':
                raise serializers.ValidationError("Invalid email or password")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")
        
        data['user'] = user
        return data

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email exists")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        
        try:
            uid = urlsafe_base64_decode(data['uid']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid user"})
        
        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({"token": "Invalid or expired token"})
        
        data['user'] = user
        return data