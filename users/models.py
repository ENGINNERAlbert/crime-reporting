from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Role choices for the user
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('law_enforcement', 'Law Enforcement'),
        ('admin', 'Admin'),
    ]

    # Status choices to track user approval/rejection
    STATUS_CHOICES = [
        ('pending', 'Pending'),  # Waiting for admin approval
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Email must be unique and is used as the username field
    email = models.EmailField(unique=True)

    # Role field for user (citizen, law enforcement, admin)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)  # Removed default

    # Status field for user approval/rejection
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', null=True, blank=True)

    # Set email as the username field for authentication
    USERNAME_FIELD = 'email'

    # Fields that should be included in the required fields when creating a user
    REQUIRED_FIELDS = ['username', 'role']  # 'role' is a required field in the admin form

    def save(self, *args, **kwargs):
        # If username is not provided, use the email username part
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role}, {self.status or 'No status'})"
