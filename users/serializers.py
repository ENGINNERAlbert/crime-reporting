from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role', 'status', 'date_joined']
        read_only_fields = ['id', 'date_joined','status']

    def create(self, validated_data):
        """
        Custom create method:
        - Username is derived from email.
        - The role is now passed from the registration form.
        - Securely set password.
        - Status is auto-set based on role.
        """
        validated_data['username'] = validated_data.get('email', '').split('@')[0]
        password = validated_data.pop('password')
        role = validated_data.get('role')

        if not role:  # Ensure the role is provided
            raise ValidationError({"role": "Role is required"})
        
        if role not in ["citizen", "law_enforcement"]:
            raise ValidationError({"role": "Invalid role. Must be 'citizen' or 'law_enforcement'."})

        if role == 'law_enforcement' and validated_data.get('status') == 'approved':
            raise ValidationError("Law enforcement users cannot be approved directly. They must be approved by an admin.")
        
        # Auto set status based on the role
        status_value = 'pending' if role == 'law_enforcement' else 'approved'
        validated_data['status'] = status_value

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        """
        Custom update method:
        - Only admin can update role or status.
        - Prevent self-update of role and status.
        """
        request = self.context.get('request')
        
        # Prevent non-admin users from updating role or status
        if request and request.user.is_authenticated and request.user.role != 'admin':
            if 'role' in validated_data or 'status' in validated_data:
                raise PermissionDenied("You are not allowed to modify your role or status.")
        
        # Prevent a user from updating role or status on their own profile unless they are an admin
        if request and request.user != instance and not request.user.role == 'admin':
            raise PermissionDenied("You can only update your own profile or contact an admin.")

        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)

        if 'role' in validated_data:
            instance.role = validated_data.get('role', instance.role)
        if 'status' in validated_data:
            instance.status = validated_data.get('status', instance.status)

        instance.save()
        return instance

    def validate_status(self, value):
        """
        Custom validation for the 'status' field to ensure it can only be one of the allowed values.
        """
        if value not in ['pending', 'approved', 'rejected']:
            raise ValidationError("Invalid status value. Allowed values are 'pending', 'approved', and 'rejected'.")
        return value

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['status'] = user.status
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            "id": self.user.id,
            "email": self.user.email,
            "role": self.user.role,
            "status": self.user.status,
        }
        return data
