from rest_framework import viewsets, permissions, filters
from .models import Listing
from .serializers import ListingSerializer
from core.permissions import IsProvider, IsOwnerOrReadOnly

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all().select_related('provider', 'provider__provider_profile')
    serializer_class = ListingSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated(), IsProvider()]
        else: # update, partial_update, destroy
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        provider_id = self.request.query_params.get('provider_id', None)
        if category:
            queryset = queryset.filter(category=category)
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        return queryset
