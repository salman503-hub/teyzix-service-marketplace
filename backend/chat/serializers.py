from rest_framework import serializers
from .models import ChatMessage
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='receiver'
    )

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'receiver', 'is_read', 'created_at']
