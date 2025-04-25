from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('acknowledgment', 'Acknowledgment of Submission'),
        ('status_update', 'Status Update'),
        ('resolution', 'Resolution Notification'),
        ('new_incident', 'New Incident Report'),
        ('geo_fence', 'Geo-fenced Notification'),
        ('crime_trend', 'Crime Trend Report'),
        ('public_safety', 'Public Safety Alert'),
        ('follow_up', 'Report Follow-Up'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    recipient_role = models.CharField(
        max_length=50,
        choices=[
            ('admin', 'Admin'),
            ('law_enforcement', 'Law Enforcement'),
            ('citizen', 'Citizen'),
        ],
        null=True,
        blank=True,
        help_text="Optional. Used when targeting users by role rather than a specific user.",
    )
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(default=None, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    related_report = models.ForeignKey(
        'reports.Report', null=True, blank=True, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"Notification to {self.recipient.username} ({self.notification_type}) at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']
