from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    # The status field will be optional, and will default to 'pending' if not provided
    status = serializers.CharField(required=False, default='pending')

    class Meta:
        model = Report
        fields = [
            'id',
            'user',
            'category',  # The type of the crime
            'description',
            'latitude',
            'longitude',
            'location',  # Read-only field, auto-generated from latitude and longitude
            'status',    # Optional field, defaults to 'pending'
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'location']  # location is auto-filled

    def create(self, validated_data):
        """
        Ensure that status is set to 'pending' if it's not provided in the request.
        """
        if 'status' not in validated_data:
            validated_data['status'] = 'pending'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Custom update method to ensure that only law enforcement and admins can update the status.
        """
        request = self.context.get('request')
        if request and request.user.role not in ['admin', 'law_enforcement']:
            # Prevent non-authorized users from modifying the status
            validated_data.pop('status', None)

        return super().update(instance, validated_data)

    def validate(self, data):
        """
        Ensure that status can only be modified by law enforcement or admin users.
        """
        request = self.context.get('request')
        if request and request.user.role not in ['admin', 'law_enforcement']:
            if 'status' in data:
                raise serializers.ValidationError("You are not authorized to modify the status of a report.")
        return data
