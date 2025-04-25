from rest_framework import serializers
from .models import CrimeStat

class CrimeStatSerializer(serializers.ModelSerializer):
    # Ensuring that the choices fields are serialized correctly
    incident_type = serializers.ChoiceField(choices=CrimeStat.INCIDENT_TYPE_CHOICES)
    user_role = serializers.ChoiceField(choices=CrimeStat.USER_ROLE_CHOICES)  # Added user_role
    status = serializers.ChoiceField(choices=CrimeStat.STATUS_CHOICES)  # Added status
    start_date = serializers.DateField()  # Added start_date
    end_date = serializers.DateField(allow_null=True, required=False)  # Added end_date (nullable)
    total_reports = serializers.IntegerField(min_value=0)
    
    class Meta:
        model = CrimeStat
        fields = ['id', 'incident_type', 'total_reports', 'user_role', 'status', 'start_date', 'end_date', 'updated_at']
        read_only_fields = ['id', 'updated_at']  # Prevent modifications to 'id' and 'updated_at'

