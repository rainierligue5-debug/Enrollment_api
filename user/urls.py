from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import login, logout, me, student_users, student_user_detail, reset_student_password

urlpatterns = [
    # Auth endpoints
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/me/', me, name='me'),
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Student users management (admin only)
    path('users/students/', student_users, name='student-users'),
    path('users/students/<int:pk>/', student_user_detail, name='student-user-detail'),
    path('users/students/<int:pk>/reset-password', reset_student_password, name='reset-student-password'),
]