from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, ProviderListView, ProviderDetailView, UserDetailView, AvatarUploadView, DashboardStatsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/avatar/', AvatarUploadView.as_view(), name='profile_avatar'),
    path('providers/', ProviderListView.as_view(), name='provider_list'),
    path('providers/<int:id>/', ProviderDetailView.as_view(), name='provider_detail'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('<int:id>/', UserDetailView.as_view(), name='user_detail'),
]
