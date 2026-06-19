from rest_framework import serializers
from .models import Project
from users.serializers import UserSerializer
from listings.serializers import ListingSerializer
from requests.serializers import ServiceRequestSerializer
from listings.models import Listing
from requests.models import ServiceRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    listing = ListingSerializer(read_only=True)
    request = ServiceRequestSerializer(read_only=True)
    
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=Listing.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='listing'
    )
    request_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceRequest.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='request'
    )
    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='provider'),
        write_only=True,
        source='provider'
    )

    class Meta:
        model = Project
        fields = [
            'id', 'customer', 'provider', 'provider_id', 'listing', 'listing_id', 
            'request', 'request_id', 'title', 'description', 'budget', 
            'deadline', 'status', 'delivery_file', 'delivery_note', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'status', 'delivery_file', 'delivery_note', 'created_at', 'updated_at']
