from django.urls import path
from .views import CrimeStatListView, reports_summary

urlpatterns = [
    # Path to list crime statistics (RBAC applied here)
    path('crime-stats/', CrimeStatListView.as_view(), name='crime-stat-list'),
    
    # Path for the reports summary (based on user role)
    path('reports/summary/', reports_summary, name='reports-summary'),
    path('crimestats/', CrimeStatListView.as_view(), name='crime-stats'),
]
