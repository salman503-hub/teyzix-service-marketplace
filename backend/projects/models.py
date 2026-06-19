from django.db import models
from django.conf import settings
from listings.models import Listing
from requests.models import ServiceRequest

class Project(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('delivered', 'Delivered'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_projects',
        limit_choices_to={'role': 'customer'}
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_projects',
        limit_choices_to={'role': 'provider'}
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='projects'
    )
    request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='projects'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Provider files upload for "Delivered" state
    delivery_file = models.FileField(upload_to='deliveries/', blank=True, null=True)
    delivery_note = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Project: {self.title} ({self.status})"
