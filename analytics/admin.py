from django.contrib import admin
from .models import CrimeStat  # Import the correct model

@admin.register(CrimeStat)
class CrimeStatAdmin(admin.ModelAdmin):
    # Ensure that these fields match the model's fields
    list_display = ('incident_type', 'user_role', 'status', 'total_reports', 'updated_at', 'start_date', 'end_date')
    
    # Ordering by 'updated_at' field to view the most recently updated crime statistics first
    ordering = ('-updated_at',)
    
    # Add filters for easy navigation in the admin panel
    list_filter = ('incident_type', 'user_role', 'status', 'start_date', 'end_date')

    # Search capability to find records based on certain fields (e.g., incident type or user role)
    search_fields = ('incident_type', 'user_role', 'status')

    # Optionally, add fieldsets to make the admin form more structured
    fieldsets = (
        (None, {
            'fields': ('incident_type', 'user_role', 'status', 'total_reports')
        }),
        ('Date Information', {
            'fields': ('start_date', 'end_date', 'updated_at')
        }),
    )
