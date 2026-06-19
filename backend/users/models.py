from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'customer')
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('provider', 'Service Provider'),
        ('admin', 'Admin'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"

class ProviderProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='provider_profile')
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    experience = models.TextField(blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    portfolio_items = models.JSONField(default=list, blank=True) # list of dicts, e.g. [{"title": "Web App", "link": "http://..."}]
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)

    def __str__(self):
        return f"Provider Profile - {self.user.username}"
