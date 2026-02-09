from rest_framework import serializers
from .models import Office


class OfficeSerializer(serializers.ModelSerializer):
    # Add a computed field for service count
    service_count = serializers.SerializerMethodField()

    class Meta:
        model = Office
        fields = [
            'id', 'name', 'code', 'address', 'phone',
            'is_active', 'service_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'service_count']

    def get_service_count(self, obj):
        """
        Return the number of active services for this office.

        This is a computed field - it's not stored in the database
        but calculated when the serializer runs.
        """
        return obj.services.filter(is_active=True).count()

    def validate_code(self, value):
        return value.upper()

    def validate(self, data):
        if data.get('name') == data.get('code'):
            raise serializers.ValidationError(
                "Office name and code cannot be the same"
            )
        return data