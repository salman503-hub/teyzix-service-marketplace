from rest_framework import serializers
from .models import ServiceRequest
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ServiceRequestSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    target_provider = UserSerializer(read_only=True)
    target_provider_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='provider'),
        write_only=True,
        required=False,
        allow_null=True,
        source='target_provider'
    )
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'title', 'requirements', 'category', 
            'category_display', 'budget', 'deadline', 'target_provider', 
            'target_provider_id', 'created_at'
        ]
        read_only_fields = ['id', 'customer', 'category_display', 'created_at']
