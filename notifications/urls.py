from django.urls import path
from .views import NotificationListCreateView, NotificationUpdateView

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/update/', NotificationUpdateView.as_view(), name='notification-update'),
]
