from django.db import models
from users.models import CustomUser  # Ensure this is the correct import for your CustomUser model

class Report(models.Model):
    CATEGORY_CHOICES = [
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
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Represents the user submitting the report
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)  # Type of the crime
    description = models.TextField()  # Description of the crime
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # Report status
    latitude = models.FloatField(default=0.0)  # Latitude for geographic location
    longitude = models.FloatField(default=0.0)  # Longitude for geographic location
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when report is created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp when report is last updated

# Add inside Report model
    @classmethod
    def get_status_choices(cls):
      return [{'value': choice[0], 'label': choice[1]} for choice in cls.STATUS_CHOICES]

    @property
    def location(self):
        """
        Combine latitude and longitude into a string representation for easy access.
        """
        return f"Lat: {self.latitude}, Lon: {self.longitude}"

    def __str__(self):
        return f"Report by {self.user.email} ({self.category}) - {self.status}"

    class Meta:
        ordering = ['-created_at']  # Orders reports by creation time (most recent first)
