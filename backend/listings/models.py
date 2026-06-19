from django.db import models
from django.conf import settings

class Listing(models.Model):
    CATEGORY_CHOICES = (
        ('web-dev', 'Website Development'),
        ('design', 'Logo & Graphic Design'),
        ('writing', 'Content Writing'),
        ('marketing', 'Digital Marketing'),
        ('video', 'Video Editing'),
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings',
        limit_choices_to={'role': 'provider'}
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='web-dev')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_time = models.IntegerField(help_text="Delivery time in days")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
