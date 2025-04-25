from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id', 'email', 'username', 'role', 'status', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('role', 'status', 'is_staff', 'is_active', 'is_superuser')
    ordering = ('-date_joined',)
    search_fields = ('email', 'username')

    fieldsets = (
        ("User Information", {"fields": ("email", "username", "password")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Role and Status", {"fields": ("role", "status")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        ("Create New User", {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "role", "status", "is_active", "is_staff", "is_superuser"),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
