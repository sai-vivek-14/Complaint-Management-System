from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class MultiFieldAuthBackend:
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Check if username contains @ (email) or is roll number
            if '@' in username:
                user = User.objects.get(email=username)
                # Non-students must login with email
                if user.user_type == 'student':
                    return None
            else:
                user = User.objects.get(roll_number=username)
                # Students must login with roll number
                if user.user_type != 'student':
                    return None
            
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None