from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import CrimeStat
from notifications.models import Notification

User = get_user_model()

@receiver(post_save, sender=CrimeStat)
def create_crimestat_notification(sender, instance, created, **kwargs):
    if created:  # Only send notification when a new CrimeStat is created
        message = f"Crime statistics updated: {instance.incident_type} - {instance.total_reports} reports."

        # Get all users with the roles 'admin' and 'law_enforcement'
        users_to_notify = User.objects.filter(role__in=['admin', 'law_enforcement'])

        # Send notification to each user
        for user in users_to_notify:
            Notification.objects.create(
                recipient=user,
                message=message,
                notification_type='crime_trend'
            )
