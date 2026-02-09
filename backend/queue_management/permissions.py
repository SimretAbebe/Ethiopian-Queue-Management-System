from rest_framework.permissions import BasePermission


class IsCitizen(BasePermission):
    """
    Allows access only to users with citizen role.

    Citizens can:
    - Create queue tickets
    - View their own queue status
    - Cancel their own queues
    - View offices and services
    """
    message = "Only citizens can access this resource."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_citizen()
        )


class IsOfficer(BasePermission):
    """
    Allows access only to users with officer role.

    Officers can:
    - Call next citizen in queue
    - Start/complete services
    - Mark citizens as no-show
    - View queue statistics for their office
    """
    message = "Only officers can access this resource."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_officer()
        )


class IsAdmin(BasePermission):
    """
    Allows access only to users with admin role.

    Admins can:
    - Everything officers can do
    - Create/edit/delete offices
    - Create/edit/delete services
    - View system-wide analytics
    - Manage users
    """
    message = "Only administrators can access this resource."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin()
        )


class IsOfficerOrAdmin(BasePermission):
    """
    Allows access to users with officer or admin role.

    Used for operations that both officers and admins can perform.
    """
    message = "Only officers and administrators can access this resource."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_officer() or request.user.is_admin())
        )


class CanManageOffice(BasePermission):
    """
    Custom permission for office management.

    Officers can only manage their assigned office.
    Admins can manage all offices.
    Citizens cannot manage offices.
    """
    message = "You don't have permission to manage this office."

    def has_object_permission(self, request, view, obj):
        """Check permissions for specific office object."""
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins can manage all offices
        if request.user.is_admin():
            return True

        # Officers can only manage their assigned office
        if request.user.is_officer():
            return request.user.office == obj

        # Citizens cannot manage offices
        return False