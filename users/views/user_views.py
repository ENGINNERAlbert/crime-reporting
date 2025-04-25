# users/views/user_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from users.utils import sync_firestore_profile
from users.serializers import UserSerializer

class TestAuthView(APIView):
    authentication_classes = [SessionAuthentication]  # We now only rely on session auth (middleware handles Firebase token)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sync_firestore_profile(request.user)  # Sync Firestore user data
        return Response({"message": "Authenticated", "user": UserSerializer(request.user).data})
