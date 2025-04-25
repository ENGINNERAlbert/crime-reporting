from rest_framework.permissions import BasePermission

class CanSubmitReport(BasePermission):
    """
    Custom permission to allow only citizens, law enforcement, and admins to submit reports.
    """
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False
        return request.user.role in ['citizen', 'law_enforcement', 'admin']


class CanViewReports(BasePermission):
    """
    Custom permission to allow all authenticated users to view reports (read-only).
    """
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False
        # All authenticated users (citizens, law enforcement, and admins) can view reports in read-only mode.
        return request.user.is_authenticated


class CanUpdateReportStatus(BasePermission):
    """
    Custom permission to allow only law enforcement and admins to update report status.
    """
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False
        return request.user.role in ['law_enforcement', 'admin']


class CanDeleteReport(BasePermission):
    """
    Custom permission to allow only admins to delete reports, and only if the report is resolved.
    """
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False
        if request.user.role == 'admin':
            # Only allow delete if report status is 'resolved'
            report = view.get_object()
            return report.status == 'resolved'
        return False
