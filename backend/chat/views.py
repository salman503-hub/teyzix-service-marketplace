from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SendMessageView(generics.CreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs.get('user_id')
        
        # Mark messages as read
        ChatMessage.objects.filter(sender_id=other_user_id, receiver=user, is_read=False).update(is_read=True)
        
        return ChatMessage.objects.filter(
            (Q(sender=user) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver=user))
        ).order_by('created_at')

class ConversationsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        sent_messages = ChatMessage.objects.filter(sender=user)
        received_messages = ChatMessage.objects.filter(receiver=user)
        
        chatted_user_ids = set()
        for msg in sent_messages:
            chatted_user_ids.add(msg.receiver_id)
        for msg in received_messages:
            chatted_user_ids.add(msg.sender_id)
            
        users = User.objects.filter(id__in=chatted_user_ids)
        conversations = []
        for u in users:
            last_msg = ChatMessage.objects.filter(
                (Q(sender=user) & Q(receiver=u)) |
                (Q(sender=u) & Q(receiver=user))
            ).order_by('-created_at').first()
            
            unread_count = ChatMessage.objects.filter(sender=u, receiver=user, is_read=False).count()
            
            conversations.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "last_message": last_msg.message if last_msg else "",
                "last_message_time": last_msg.created_at if last_msg else None,
                "unread_count": unread_count
            })
            
        conversations.sort(key=lambda x: x['last_message_time'] if x['last_message_time'] is not None else x['id'], reverse=True)
        return Response(conversations)
