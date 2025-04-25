from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils.timezone import now, timedelta
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from reports.models import Report
from .models import CrimeStat
from .serializers import CrimeStatSerializer
from rest_framework.permissions import BasePermission


# ======== Permissions ========
class IsAdminOrLawEnforcement(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'law_enforcement']


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ======== CrimeStat List View (RBAC applied) ========
class CrimeStatListView(generics.ListAPIView):
    serializer_class = CrimeStatSerializer
    permission_classes = [IsAuthenticated, IsAdminOrLawEnforcement]

    def get_queryset(self):
        user_role = self.request.user.role

        # Admins and Law Enforcement see all
        if user_role in ['admin', 'law_enforcement']:
            return CrimeStat.objects.all()

        # Citizens shouldn't reach this view (permission blocks it)
        return CrimeStat.objects.none()  # Safety fallback


# ======== Summary Analytics View ========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_summary(request):
    user_role = request.user.role
    total_reports = Report.objects.count()

    # === Admin Users ===
    if user_role == 'admin':
        reports_by_category = (
            Report.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        reports_by_status = (
            Report.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        last_30_days = now() - timedelta(days=30)
        reports_over_time = (
            Report.objects.filter(created_at__gte=last_30_days)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )

    # === Law Enforcement Users ===
    elif user_role == 'law_enforcement':
        reports_by_category = (
            Report.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Example: Show only active reports
        reports_by_status = (
            Report.objects.filter(status__in=['pending', 'in_progress'])
            .values('status')
            .annotate(count=Count('id'))
        )

        reports_over_time = []  # Not shown

    # === Citizen Users ===
    else:
        reports_by_category = (
            Report.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        reports_by_status = []  # Not shown
        reports_over_time = []  # Not shown

    return Response({
        "total_reports": total_reports,
        "reports_by_category": list(reports_by_category),
        "reports_by_status": list(reports_by_status),
        "reports_over_time": list(reports_over_time),
    })
