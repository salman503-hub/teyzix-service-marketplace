from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Project
from .serializers import ProjectSerializer
from core.permissions import IsCustomer, IsProvider

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'customer':
            serializer.save(customer=user)
        elif user.role == 'provider':
            request_obj = serializer.validated_data.get('request')
            if not request_obj:
                raise ValidationError("Providers can only start projects by accepting a customer request.")
            serializer.save(
                provider=user,
                customer=request_obj.customer,
                status='accepted'
            )

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()
            
        if user.role == 'admin':
            return Project.objects.all().select_related('customer', 'provider', 'listing', 'request')
        elif user.role == 'provider':
            return Project.objects.filter(provider=user).select_related('customer', 'provider', 'listing', 'request')
        else: # customer
            return Project.objects.filter(customer=user).select_related('customer', 'provider', 'listing', 'request')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsProvider])
    def accept(self, request, pk=None):
        project = self.get_object()
        if project.status != 'pending':
            return Response({"error": "Only pending projects can be accepted."}, status=status.HTTP_400_BAD_REQUEST)
        project.status = 'accepted'
        project.save()
        return Response(ProjectSerializer(project).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsProvider])
    def start(self, request, pk=None):
        project = self.get_object()
        if project.status != 'accepted':
            return Response({"error": "Only accepted projects can be started."}, status=status.HTTP_400_BAD_REQUEST)
        project.status = 'in_progress'
        project.save()
        return Response(ProjectSerializer(project).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsProvider])
    def complete(self, request, pk=None):
        # Provider marks project as completed (uploads files to complete)
        project = self.get_object()
        if project.status != 'in_progress':
            return Response({"error": "Only in-progress projects can be completed."}, status=status.HTTP_400_BAD_REQUEST)
        
        delivery_file = request.FILES.get('delivery_file')
        delivery_note = request.data.get('delivery_note', '')
        
        if delivery_file:
            project.delivery_file = delivery_file
        if delivery_note:
            project.delivery_note = delivery_note
            
        project.status = 'completed'
        project.save()
        return Response(ProjectSerializer(project).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsCustomer])
    def deliver(self, request, pk=None):
        # Customer accepts delivery and marks as delivered
        project = self.get_object()
        if project.status != 'completed':
            return Response({"error": "Only completed/submitted projects can be approved/delivered."}, status=status.HTTP_400_BAD_REQUEST)
        project.status = 'delivered'
        project.save()
        return Response(ProjectSerializer(project).data)
