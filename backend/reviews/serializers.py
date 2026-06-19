from rest_framework import serializers
from .models import Review
from projects.models import Project
from users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        write_only=True,
        source='project'
    )

    class Meta:
        model = Review
        fields = ['id', 'project_id', 'customer', 'provider', 'rating', 'feedback', 'created_at']
        read_only_fields = ['id', 'customer', 'provider', 'created_at']

    def validate(self, attrs):
        project = attrs['project']
        if project.status not in ['completed', 'delivered']:
            raise serializers.ValidationError("Reviews can only be submitted for completed or delivered projects.")
        
        if hasattr(project, 'review'):
            raise serializers.ValidationError("This project has already been reviewed.")
            
        request = self.context.get('request')
        if request and project.customer != request.user:
            raise serializers.ValidationError("Only the customer of this project can write a review.")
            
        return attrs

    def create(self, validated_data):
        project = validated_data['project']
        # Automatically mark project as delivered when review is written
        if project.status == 'completed':
            project.status = 'delivered'
            project.save()
            
        validated_data['customer'] = project.customer
        validated_data['provider'] = project.provider
        return super().create(validated_data)
