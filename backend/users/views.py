from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from listings.models import Listing
from requests.models import ServiceRequest
from projects.models import Project
from .models import ProviderProfile
from .serializers import RegisterSerializer, UserSerializer, ProviderProfileSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data
        
        # Split data for user and profile
        profile_data = data.pop('provider_profile', None)
        
        user_serializer = UserSerializer(user, data=data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
            
            # If provider, update profile data
            if user.role == 'provider' and profile_data is not None:
                profile, created = ProviderProfile.objects.get_or_create(user=user)
                profile_serializer = ProviderProfileSerializer(profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                else:
                    return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            return Response(UserSerializer(user).data)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProviderListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = User.objects.filter(role='provider').select_related('provider_profile')
        search = self.request.query_params.get('search', None)
        skills = self.request.query_params.get('skills', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(username__icontains=search) | queryset.filter(provider_profile__bio__icontains=search)
            
        if skills:
            # simple filter checking if any skill matches
            queryset = queryset.filter(provider_profile__skills__icontains=skills)
            
        return queryset

class ProviderDetailView(generics.RetrieveAPIView):
    queryset = User.objects.filter(role='provider')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'provider':
            return Response({"error": "Only providers have profiles with avatars."}, status=status.HTTP_400_BAD_REQUEST)
            
        profile, created = ProviderProfile.objects.get_or_create(user=user)
        if 'profile_picture' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        return Response(ProviderProfileSerializer(profile).data)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.role == 'customer':
            active_projects = Project.objects.filter(customer=user, status__in=['pending', 'accepted', 'in_progress', 'completed'])
            completed_projects = Project.objects.filter(customer=user, status='delivered')
            active_requests = ServiceRequest.objects.filter(customer=user)
            total_spent = completed_projects.aggregate(Sum('budget'))['budget__sum'] or 0.00
            
            return Response({
                "role": "customer",
                "active_projects_count": active_projects.count(),
                "completed_projects_count": completed_projects.count(),
                "active_requests_count": active_requests.count(),
                "total_spent": total_spent
            })
            
        elif user.role == 'provider':
            active_projects = Project.objects.filter(provider=user, status__in=['accepted', 'in_progress', 'completed'])
            pending_requests = Project.objects.filter(provider=user, status='pending')
            completed_projects = Project.objects.filter(provider=user, status='delivered')
            earnings = completed_projects.aggregate(Sum('budget'))['budget__sum'] or 0.00
            listings_count = Listing.objects.filter(provider=user).count()
            
            return Response({
                "role": "provider",
                "earnings": earnings,
                "active_projects_count": active_projects.count(),
                "pending_requests_count": pending_requests.count(),
                "completed_projects_count": completed_projects.count(),
                "listings_count": listings_count
            })
            
        elif user.role == 'admin':
            user_count = User.objects.count()
            customer_count = User.objects.filter(role='customer').count()
            provider_count = User.objects.filter(role='provider').count()
            listing_count = Listing.objects.count()
            project_count = Project.objects.count()
            completed_project_count = Project.objects.filter(status='delivered').count()
            request_count = ServiceRequest.objects.count()
            total_volume = Project.objects.filter(status='delivered').aggregate(Sum('budget'))['budget__sum'] or 0.00
            
            return Response({
                "role": "admin",
                "users": {
                    "total": user_count,
                    "customers": customer_count,
                    "providers": provider_count
                },
                "services": {
                    "total_listings": listing_count,
                    "total_requests": request_count
                },
                "projects": {
                    "total": project_count,
                    "completed": completed_project_count,
                    "transaction_volume": total_volume
                }
            })
