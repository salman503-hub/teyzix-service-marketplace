from django.db import models
from django.conf import settings
from django.db.models import Avg
from projects.models import Project

class Review(models.Model):
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='review'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_written',
        limit_choices_to={'role': 'customer'}
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_received',
        limit_choices_to={'role': 'provider'}
    )
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.provider.username} - Rating: {self.rating}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate average rating and total reviews for the provider profile
        profile = getattr(self.provider, 'provider_profile', None)
        if profile:
            reviews = Review.objects.filter(provider=self.provider)
            profile.total_reviews = reviews.count()
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            profile.average_rating = round(avg_rating, 2) if avg_rating is not None else 0.0
            profile.save()
