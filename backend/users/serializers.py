from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ProviderProfile

User = get_user_model()

class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'profile_picture', 'bio', 'skills', 'experience', 
            'hourly_rate', 'portfolio_items', 'average_rating', 'total_reviews'
        ]
        read_only_fields = ['id', 'average_rating', 'total_reviews']

class UserSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'created_at', 'provider_profile']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone']
        extra_kwargs = {
            'phone': {'required': False}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'customer')
        
        user = User.objects.create_user(password=password, **validated_data)
        
        # If user is a provider, automatically create an empty profile
        if role == 'provider':
            ProviderProfile.objects.create(user=user)
            
        return user
