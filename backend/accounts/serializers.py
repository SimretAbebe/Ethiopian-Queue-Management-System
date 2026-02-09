from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for returning user data.
    Maps Django field names to frontend expected names.
    """
    firstName = serializers.CharField(source='first_name', required=False, allow_blank=True)
    lastName = serializers.CharField(source='last_name', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'firstName', 'lastName', 'role']
        read_only_fields = ['id', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Requires username, password, and role.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=['citizen', 'officer', 'admin'], default='citizen')

    class Meta:
        model = User
        fields = ['username', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'citizen'),
        )
        return user
