from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from core.permissions import IsCustomer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('customer', 'provider', 'project')
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.AllowAny()]

class ProviderReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        provider_id = self.kwargs.get('provider_id')
        return Review.objects.filter(provider_id=provider_id).select_related('customer', 'provider')
