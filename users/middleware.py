import firebase_admin
from firebase_admin import auth, firestore
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated
import logging

# Initialize Firebase if not already initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# Firestore client
db = firestore.client()

# Setup logging for debugging (optional)
logger = logging.getLogger(__name__)

# 🔒 Permissions

class CanSubmitReport(BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has a valid role
        if not request.user or request.user.is_anonymous:
            return False
        return request.user.role in ['citizen', 'law_enforcement']

class CanViewReports(BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has a valid role
        if not request.user or request.user.is_anonymous:
            return False
        return request.user.role in ['law_enforcement', 'admin']

# 📄 Views

class ReportListCreateView(APIView):
    permission_classes = [CanSubmitReport]

    def get(self, request):
        if not request.user or request.user.role not in ['law_enforcement', 'admin']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user or request.user.is_anonymous:
            return JsonResponse({"error": "Authentication required"}, status=401)

        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        data = request.data
        data['user'] = request.user.id

        serializer = ReportSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportDetailView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request, pk):
        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

        if not request.user or request.user.role not in ['law_enforcement', 'admin']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def put(self, request, pk):
        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

        if not request.user or request.user.role not in ['law_enforcement', 'admin']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        from reports.models import Report  # Lazy import to avoid circular import

        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

        if not request.user or request.user.role != 'admin':
            return JsonResponse({"error": "Forbidden"}, status=403)

        report.delete()
        return JsonResponse({"message": "Report deleted successfully"}, status=204)

class AdminManageReportsView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        if not request.user or request.user.role not in ['admin', 'law_enforcement']:
            return JsonResponse({"error": "Forbidden"}, status=403)

        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        from reports.models import Report  # Lazy import to avoid circular import
        from .serializers import ReportSerializer

        if not request.user or request.user.role != 'admin':
            return JsonResponse({"error": "Forbidden"}, status=403)

        data = request.data
        data['user'] = request.user.id

        serializer = ReportSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 🚀 Redirect based on role (for frontend)

class RoleRedirectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.is_anonymous:
            return JsonResponse({"error": "Role not found"}, status=400)

        role = request.user.role

        if role == "admin":
            return JsonResponse({"redirect": "/admin-dashboard/"})
        elif role == "law_enforcement":
            return JsonResponse({"redirect": "/law-enforcement-dashboard/"})
        else:
            return JsonResponse({"redirect": "/report-crime/"})

# 🙋‍♀️ Logged-in user info

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_anonymous:
            return JsonResponse({"error": "User not authenticated"}, status=401)

        return JsonResponse({
            "uid": request.user.username,
            "email": request.user.email,
            "role": getattr(request.user, "role", "citizen")
        })

# Firebase Auth Middleware
class FirebaseAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            id_token = auth_header.split(" ")[1]

            try:
                decoded_token = auth.verify_id_token(id_token)
                uid = decoded_token["uid"]
                logger.debug(f"✅ Decoded UID: {uid}")

                # Dynamically get user model
                User = get_user_model()

                user, created = User.objects.get_or_create(
                    firebase_uid=uid,
                    defaults={"email": decoded_token.get("email", ""), "username": uid}
                )

                # Fetch the user's role from Firestore
                user_ref = db.collection('users').document(uid)
                user_doc = user_ref.get()

                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    role = user_data.get("role", "citizen")  # Default to "citizen" if no role is provided
                    logger.debug(f"📄 Firestore user doc: {user_data}")
                    logger.debug(f"🎭 Assigned role: {role}")

                    user.role = role
                    user.save()
                else:
                    logger.warning(f"Firestore document for UID {uid} not found, assigning default role 'citizen'")
                    user.role = "citizen"
                    user.save()

                # Attach the authenticated user to the request object
                request.user = user
                logger.debug(f"User {user.username} with role {user.role} attached to request.")

            except auth.ExpiredIdTokenError:
                logger.error(f"❌ Firebase ID Token has expired: {id_token}")
                request.user = None
                return JsonResponse({"error": "Token has expired"}, status=401)

            except auth.InvalidIdTokenError:
                logger.error(f"❌ Invalid Firebase ID Token: {id_token}")
                request.user = None
                return JsonResponse({"error": "Invalid Token"}, status=401)

            except Exception as e:
                logger.error(f"❌ Error verifying token or fetching user data: {e}")
                request.user = None
                return JsonResponse({"error": "Authentication failed"}, status=401)

        else:
            request.user = None

        return self.get_response(request)
