# FILE: custom_auth/models.py
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',  # Add related_name to avoid conflict
        blank=True,
        help_text='The groups this user belongs to.',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  # Add related_name to avoid conflict
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='customuser',
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'