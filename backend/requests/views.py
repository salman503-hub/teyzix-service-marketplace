from rest_framework import viewsets, permissions, filters
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer
from core.permissions import IsCustomer, IsOwnerOrReadOnly

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all().select_related('customer', 'target_provider')
    serializer_class = ServiceRequestSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'requirements']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCustomer()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        else:
            return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return ServiceRequest.objects.none()
            
        if user.role == 'admin':
            return queryset
            
        # Providers only see requests that haven't been converted to projects yet
        if user.role == 'provider':
            queryset = queryset.filter(projects__isnull=True)
            
        customer_id = self.request.query_params.get('customer_id', None)
        target_provider_id = self.request.query_params.get('target_provider_id', None)
        category = self.request.query_params.get('category', None)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if target_provider_id:
            queryset = queryset.filter(target_provider_id=target_provider_id)
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset
