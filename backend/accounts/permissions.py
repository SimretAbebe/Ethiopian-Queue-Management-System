from rest_framework.permissions import BasePermission


class IsCitizen(BasePermission):
    """Allows access only to authenticated citizens."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_citizen()
        )


class IsOfficer(BasePermission):
    """Allows access only to authenticated officers."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_officer()
        )


class IsAdmin(BasePermission):
    """Allows access only to authenticated administrators."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin()
        )


class IsOfficerOrAdmin(BasePermission):
    """Allows access to officers and administrators."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_officer() or request.user.is_admin())
        )


class CanManageOffice(BasePermission):
    """Custom permission that checks if user can manage a specific office."""
    def has_object_permission(self, request, view, obj):
        # obj should be an Office instance
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_manage_office(obj)
        )