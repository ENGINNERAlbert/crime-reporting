from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.serializers import UserSerializer, MyTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied
from django.http import JsonResponse

User = get_user_model()

# ✅ JWT Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ✅ Permission: Allow only admins
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"

# ✅ Test Authentication (for debugging)
class TestAuthView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Authenticated",
            "user": UserSerializer(request.user).data
        })

# ✅ Retrieve and Update User Profile
class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        if 'role' in request.data or 'status' in request.data:
            raise PermissionDenied("You are not allowed to modify your role or status.")

        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Alias for current user
class CurrentUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

# ✅ List All Users (Admins Only)
class UserListView(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

# ✅ Register a New User
class UserCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        role = request.data.get("role", "citizen")
        if role not in ["citizen", "law_enforcement"]:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        status_value = "pending" if role == "law_enforcement" else "approved"
        email = request.data.get("email", "")
        username = email.split('@')[0] if email else ""

        # Add optional law enforcement fields
        rank = request.data.get("rank")
        details = request.data.get("details")

        modified_data = {
            **request.data,
            "username": username,
            "role": role,
            "status": status_value,
            "rank": rank if role == "law_enforcement" else None,
            "details": details if role == "law_enforcement" else None,
        }

        serializer = UserSerializer(data=modified_data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Approve or Reject Law Enforcement (Admin Only)
class ApproveLawEnforcementView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user.role != "law_enforcement":
                return Response({"message": "This user is not a law enforcement officer."}, status=status.HTTP_400_BAD_REQUEST)

            action = request.data.get("action")
            if action not in ["approve", "reject"]:
                return Response({"message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

            user.status = "approved" if action == "approve" else "rejected"
            user.save()
            return Response({"message": f"Law enforcement user {action}d successfully."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# ✅ Update Law Enforcement Status (Admin Only)
class UpdateUserStatusView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user.role != "law_enforcement":
                return Response({"message": "This user is not a law enforcement officer."}, status=status.HTTP_400_BAD_REQUEST)

            action = request.data.get("action")
            if action not in ["approve", "reject"]:
                return Response({"message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

            user.status = "approved" if action == "approve" else "rejected"
            user.save()
            return Response({"message": f"Law enforcement user {action}d successfully."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# ✅ Update User Role (Admin Only)
class UpdateUserRoleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        new_role = request.data.get('role')
        if new_role not in ['admin', 'law_enforcement', 'citizen']:
            return JsonResponse({'error': 'Invalid role'}, status=400)

        user.role = new_role
        user.save()
        return JsonResponse({'message': f'User role updated to {new_role}'})
