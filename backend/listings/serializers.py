from rest_framework import serializers
from .models import Listing
from users.serializers import UserSerializer

class ListingSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'provider', 'title', 'description', 'category', 
            'category_display', 'price', 'delivery_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'provider', 'category_display', 'created_at', 'updated_at']
