from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model
from reports.serializers import ReportSerializer # Assuming you have a ReportSerializer for related reports

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    # Including the related report details via nested serializer
    related_report = ReportSerializer(read_only=True)  # If you want to display the report information when available

    # Updating the recipient to use user primary key (logged-in user)
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Notification
        fields = [
            'id', 
            'recipient', 
            'message', 
            'notification_type', 
            'timestamp', 
            'sent_at', 
            'is_read', 
            'related_report'
        ]
        read_only_fields = ['id', 'timestamp', 'sent_at', 'is_read']

    def validate_message(self, value):
        # Adding custom validation for message length
        if len(value) > 500:
            raise serializers.ValidationError("Message cannot exceed 500 characters.")
        return value

    def create(self, validated_data):
        """
        Override the create method to automatically set the recipient to the logged-in user.
        """
        validated_data['recipient'] = self.context['request'].user  # Set the recipient to the logged-in user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update existing notification
        instance.is_read = validated_data.get('is_read', instance.is_read)
        instance.sent_at = validated_data.get('sent_at', instance.sent_at)
        instance.save()
        return instance
