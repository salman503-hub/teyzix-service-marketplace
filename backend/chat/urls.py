from django.urls import path
from .views import SendMessageView, ChatHistoryView, ConversationsListView

urlpatterns = [
    path('messages/send/', SendMessageView.as_view(), name='send_message'),
    path('messages/<int:user_id>/', ChatHistoryView.as_view(), name='chat_history'),
    path('conversations/', ConversationsListView.as_view(), name='conversations_list'),
]
