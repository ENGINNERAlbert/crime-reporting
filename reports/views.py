from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import JsonResponse
from django.db.models import Count, Case, When, Value, CharField, F

from .models import Report
from .serializers import ReportSerializer


# ----- Permissions -----
class CanSubmitReport(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['citizen', 'law_enforcement', 'admin']


class CanViewReports(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated


class CanUpdateReportStatus(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['law_enforcement', 'admin']


class CanDeleteReport(BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'admin':
            report = view.get_object()
            return report.status == 'resolved'
        return False


# ----- Views -----

class ReportListCreateView(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), CanSubmitReport()]
        if self.request.method == 'GET':
            return [IsAuthenticated(), CanViewReports()]
        return [IsAuthenticated()]

    def get(self, request):
        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)

        # Include status choices in the response
        status_choices = [
            {"value": choice[0], "label": choice[1]}
            for choice in Report.STATUS_CHOICES
        ]

        return Response({
            "reports": serializer.data,
            "status_choices": status_choices
        })

    def post(self, request):
        data = request.data
        data['user'] = request.user.id

        serializer = ReportSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportDetailView(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated(), CanViewReports()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [IsAuthenticated(), CanUpdateReportStatus()]
        elif self.request.method == 'DELETE':
            return [IsAuthenticated(), CanDeleteReport()]
        return []

    def get_object(self, pk):
        try:
            return Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return None

    def get(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def put(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return JsonResponse({"error": "Report not found"}, status=404)

        if request.user.role != 'admin':
            return JsonResponse({"error": "Forbidden"}, status=403)

        if report.status != 'resolved':
            return JsonResponse({"error": "Only resolved reports can be deleted"}, status=403)

        report.delete()
        return JsonResponse({"message": "Report deleted successfully"}, status=204)


class ManageReportsView(APIView):
    permission_classes = [IsAuthenticated, CanUpdateReportStatus]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        reports = Report.objects.all().order_by('-created_at')
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

        allowed_fields = ['status']
        data = {field: request.data[field] for field in allowed_fields if field in request.data}

        serializer = ReportSerializer(report, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return JsonResponse({"error": "Only admins can delete reports"}, status=403)

        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

        if report.status != 'resolved':
            return JsonResponse({"error": "Only resolved reports can be deleted"}, status=403)

        report.delete()
        return JsonResponse({"message": "Report deleted successfully"}, status=204)


class RoleRedirectView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        if not hasattr(request.user, 'role'):
            return JsonResponse({"error": "Role not found"}, status=400)

        role = request.user.role

        if role == "admin":
            return JsonResponse({"redirect": "/admin-dashboard/"})
        elif role == "law_enforcement":
            return JsonResponse({"redirect": "/law-enforcement-dashboard/"})
        else:
            return JsonResponse({"redirect": "/report-crime/"})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({
            "uid": request.user.username,
            "email": request.user.email,
            "role": getattr(request.user, "role", "citizen")
        })


class AllReportsReadOnlyView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, CanUpdateReportStatus]

    def get(self, request):
        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        reports = Report.objects.all().order_by('-created_at')
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)


class ReportsSummaryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):
        user = request.user
        reports = Report.objects.all()
        if user.role == 'citizen':
            reports = reports.filter(user=user)

        total_reports = reports.count()

        reports_by_status = (
            reports.values('status')
            .annotate(count=Count('status'))
            .order_by('-count')
        )

        reports_by_category = (
            reports.annotate(
                category_cleaned=Case(
                    When(category='', then=Value('uncategorized')),
                    default=F('category'),
                    output_field=CharField()
                )
            )
            .values('category_cleaned')
            .annotate(count=Count('category_cleaned'))
            .order_by('-count')
        )

        return Response({
            "total_reports": total_reports,
            "reports_by_status": list(reports_by_status),
            "reports_by_category": [
                {"category": item["category_cleaned"], "count": item["count"]}
                for item in reports_by_category
            ]
        })


class CrimeStatsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):
        if request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        stats = {
            "total_reports": Report.objects.count(),
            "pending": Report.objects.filter(status='pending').count(),
            "in_progress": Report.objects.filter(status='in_progress').count(),
            "resolved": Report.objects.filter(status='resolved').count(),
            "rejected": Report.objects.filter(status='rejected').count(),
        }
        return Response(stats)


class ReportStatusChoicesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        status_choices = [
            {"value": choice[0], "label": choice[1]}
            for choice in Report.STATUS_CHOICES
        ]
        return Response(status_choices)
