from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import redirect
from django.urls import resolve
from django.contrib import messages

class UserTypeMiddleware(MiddlewareMixin):
    """
    Middleware to direct users to the appropriate dashboard based on user_type.
    """
    
    def process_request(self, request):
        if not request.user.is_authenticated:
            return None
        
        # Get current URL name
        current_url = resolve(request.path_info).url_name
        user_type = request.user.user_type
        
        # Dashboard path mappings
        dashboards = {
            'student': 'student_dashboard',
            'warden': 'warden_dashboard',
            'worker': 'worker_dashboard',
            'hostel_staff': 'staff_dashboard'
        }
        
        # Exclude static files, admin, login/logout, etc.
        excluded_paths = ['login', 'logout', 'profile', 'password_change', 'admin']
        if any(path in current_url for path in excluded_paths):
            return None
        
        # If user is trying to access another user type's area
        if (current_url.startswith('student_') and user_type != 'student') or \
           (current_url.startswith('warden_') and user_type != 'warden') or \
           (current_url.startswith('worker_') and user_type != 'worker') or \
           (current_url.startswith('staff_') and user_type != 'hostel_staff'):
            
            # Redirect to appropriate dashboard
            correct_dashboard = dashboards.get(user_type)
            if correct_dashboard:
                messages.warning(request, f"You've been redirected to your {user_type} dashboard.")
                return redirect(correct_dashboard)
        
        return None