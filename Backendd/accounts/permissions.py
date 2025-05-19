# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsWarden(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'warden'
