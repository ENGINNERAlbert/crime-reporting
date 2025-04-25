# notifications/permissions.py
from rest_framework.permissions import BasePermission

class IsAuthenticated(BasePermission):
    """
    Custom permission to check if the user is authenticated.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated
        return request.user and request.user.is_authenticated


class IsAdminOrAuthenticated(BasePermission):
    """
    Custom permission to allow only admins or authenticated users to access certain views.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if request.user and request.user.is_authenticated:
            # Admin users can access everything
            if request.user.role == 'admin':
                return True
            # Regular users can access their own data
            return True  # or modify this as needed for regular users
        return False  # Unauthenticated users cannot access
