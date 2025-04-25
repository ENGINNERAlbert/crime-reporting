from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'description', 'category', 'location', 'status', 'created_at')  # Ensure all fields exist
    ordering = ('created_at',)  # Ensure created_at exists in the model
    list_filter = ('category', 'status', 'created_at')  # Ensure fields exist

    def location(self, obj):
        """Custom method to display the location in admin."""
        return obj.location  # Calls the location property in the Report model

    location.admin_order_field = 'latitude'  # Optionally, allow sorting by latitude in the admin
    location.short_description = 'Location'  # Custom column name in the admin UI
