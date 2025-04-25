from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('message', 'recipient', 'timestamp')  # Ensure fields exist in the model
