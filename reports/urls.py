from django.urls import path
from .views import (
    ReportListCreateView,
    ReportDetailView,
    ManageReportsView,
    RoleRedirectView,
    CurrentUserView,
    AllReportsReadOnlyView,
    ReportsSummaryView,
    ReportStatusChoicesView  # ✅ Added this import
)

urlpatterns = [
    path('', ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('manage/', ManageReportsView.as_view(), name='manage-reports'),
    path('redirect/', RoleRedirectView.as_view(), name='role-redirect'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('all/', AllReportsReadOnlyView.as_view(), name='all-reports-read-only'),
    path('summary/', ReportsSummaryView.as_view(), name='reports-summary'),
    path('status-choices/', ReportStatusChoicesView.as_view(), name='report-status-choices'),  # ✅ Added this route
]
