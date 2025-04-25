# analytics/tasks.py

from .models import CrimeStat
from notifications.models import Notification
from django.utils.timezone import now, timedelta

def check_crime_spike():
    recent = CrimeStat.objects.filter(start_date__gte=now() - timedelta(days=1))
    for stat in recent:
        if stat.total_reports > 50:  # Example threshold
            Notification.objects.create(
                recipient_role='admin',
                message=f"Alert: Spike in {stat.incident_type} reports!",
                notification_type='crime_trend'
            )
