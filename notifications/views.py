from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from .permissions import IsAdminOrAuthenticated  # Use custom permission

class NotificationListCreateView(generics.ListCreateAPIView):
    """
    List all notifications for the current user.
    Admins see all, others only their own.
    Create logic is retained, but frontend won't use it for now.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Notification.objects.all()
        return Notification.objects.filter(recipient=user)

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)


class NotificationUpdateView(generics.UpdateAPIView):
    """
    Allows PATCH to mark notification as read or update sent_at.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]  # Allow only authenticated users
    http_method_names = ['patch']
