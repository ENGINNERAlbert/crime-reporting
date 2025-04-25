from django.urls import path
from users.views import (
    MyTokenObtainPairView, TestAuthView, UserDetailView, CurrentUserView,
    UserListView, UserCreateView, ApproveLawEnforcementView,
    UpdateUserStatusView, UpdateUserRoleView  # ✅ added
)

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('test-auth/', TestAuthView.as_view(), name='test_auth'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', UserDetailView.as_view(), name='user_profile'),
    path('', UserListView.as_view(), name='user_list'),
    path('create/', UserCreateView.as_view(), name='user_create'),
    path('<int:user_id>/approve/', ApproveLawEnforcementView.as_view(), name='approve_user'),
    path('<int:user_id>/status/', UpdateUserStatusView.as_view(), name='update_user_status'),
    path('<int:pk>/', UpdateUserRoleView.as_view(), name='update_user_role'),  # ✅ added
]
