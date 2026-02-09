from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with roles for the queue management system.
    Extends Django's AbstractUser to add role-based permissions.
    """

    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('officer', 'Officer'),
        ('admin', 'Administrator'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='citizen',
        help_text="User's role in the system"
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="User's phone number for SMS notifications"
    )

    office = models.ForeignKey(
        'queue_management.Office',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Office where officer/admin works (null for citizens)"
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def is_citizen(self):
        """Check if user has citizen role"""
        return self.role == 'citizen'

    def is_officer(self):
        """Check if user has officer role"""
        return self.role == 'officer'

    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'admin'

    def can_manage_office(self, office):
        """
        Check if user can manage a specific office.
        Officers can only manage their assigned office.
        Admins can manage all offices.
        """
        if self.is_admin():
            return True
        if self.is_officer() and self.office == office:
            return True
        return False

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"