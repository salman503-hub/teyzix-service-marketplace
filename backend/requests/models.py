from django.db import models
from django.conf import settings
from listings.models import Listing

class ServiceRequest(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests',
        limit_choices_to={'role': 'customer'}
    )
    title = models.CharField(max_length=255)
    requirements = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=Listing.CATEGORY_CHOICES,
        default='web-dev'
    )
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    # Optional targeted provider
    target_provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='targeted_requests',
        limit_choices_to={'role': 'provider'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.customer.username}"
