from django.db import models
from django.utils import timezone

class CrimeStat(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('theft', 'Theft'),
        ('assault', 'Assault'),
        ('fraud', 'Fraud'),
        ('vandalism', 'Vandalism'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]

    USER_ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('law_enforcement', 'Law Enforcement'),
        ('admin', 'Admin'),
    ]

    NOTIFICATION_TYPE_CHOICES = [
        ('acknowledgment', 'Acknowledgment of Submission'),
        ('status_update', 'Status Update'),
        ('resolution', 'Resolution Notification'),
        ('new_incident', 'New Incident Report'),
        ('geo_fence', 'Geo-fenced Notification'),
        ('crime_trend', 'Crime Trend Report'),
        ('public_safety', 'Public Safety Alert'),
        ('follow_up', 'Report Follow-Up'),
    ]

    # --- Fields ---
    user_role = models.CharField(
        max_length=50, choices=USER_ROLE_CHOICES, default='citizen',
        help_text="Role allowed to view this statistic"
    )

    incident_type = models.CharField(
        max_length=50, choices=INCIDENT_TYPE_CHOICES, default='other'
    )

    total_reports = models.PositiveIntegerField(
        default=0, help_text="Total number of reports for this type and role"
    )

    # Breakdown by status
    pending = models.PositiveIntegerField(default=0)
    in_progress = models.PositiveIntegerField(default=0)
    resolved = models.PositiveIntegerField(default=0)
    rejected = models.PositiveIntegerField(default=0)

    # Optional general status tag (summary category)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )

    start_date = models.DateField(
        default=timezone.now, help_text="Start of reporting period"
    )

    end_date = models.DateField(
        null=True, blank=True, help_text="End of reporting period"
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Last updated timestamp"
    )

    notification_type = models.CharField(
        max_length=50, choices=NOTIFICATION_TYPE_CHOICES, default='acknowledgment'
    )

    class Meta:
        ordering = ['-updated_at']
        unique_together = ('incident_type', 'user_role', 'status')
        verbose_name = "Crime Statistics"
        verbose_name_plural = "Crime Statistics"

    def __str__(self):
        return f"{self.incident_type} - {self.total_reports} reports ({self.status})"
