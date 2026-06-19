from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, ProviderReviewListView

router = DefaultRouter()
router.register(r'', ReviewViewSet, basename='review')

urlpatterns = [
    path('provider/<int:provider_id>/', ProviderReviewListView.as_view(), name='provider_reviews'),
    path('', include(router.urls)),
]
