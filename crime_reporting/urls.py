from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView  # ✅ Import your custom JWT login view

urlpatterns = [
    path('admin/', admin.site.urls),

    # App endpoints
    path('api/users/', include('users.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),

    # ✅ JWT authentication endpoints
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
