from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer, AdminUserSerializer, generate_temp_password
from core.models import Student

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.check_password(password):
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'User account is disabled'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    return Response({'message': 'Logout successful'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    
    # PATCH - update current user profile
    user = request.user
    data = request.data
    
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_users(request):
    """Admin: List all student users or create new student user"""
    if not request.user.is_admin_role:
        return Response(
            {'error': 'Permission denied. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        student_users = User.objects.filter(role='student').select_related('student')
        return Response(AdminUserSerializer(student_users, many=True).data)
    
    # POST - create new student user
    data = request.data
    student = None
    
    # Link to existing Student if student_id provided
    if 'student_id' in data:
        try:
            student = Student.objects.get(student_id=data['student_id'])
        except Student.DoesNotExist:
            return Response(
                {'error': f'Student with ID {data["student_id"]} not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Check if email already exists
    if User.objects.filter(email=data.get('email')).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        email=data.get('email'),
        name=data.get('name'),
        password=data.get('password', 'student123'),
        role='student',
        student=student
    )
    
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_user_detail(request, pk):
    """Admin: Get, update, or delete a student user"""
    if not request.user.is_admin_role:
        return Response(
            {'error': 'Permission denied. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=pk, role='student')
    except User.DoesNotExist:
        return Response(
            {'error': 'Student user not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    
    if request.method in ['PUT', 'PATCH']:
        data = request.data
        
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if new email already exists
            if User.objects.exclude(pk=pk).filter(email=data['email']).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = data['email']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        # Update student link if student_id provided
        if 'student_id' in data:
            if data['student_id']:
                try:
                    student = Student.objects.get(student_id=data['student_id'])
                    user.student = student
                except Student.DoesNotExist:
                    return Response(
                        {'error': f'Student with ID {data["student_id"]} not found'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                user.student = None
        
        user.save()
        return Response(UserSerializer(user).data)
    
    if request.method == 'DELETE':
        user.delete()
        return Response({'message': 'Student user deleted successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_student_password(request, pk):
    """Admin: Reset student user password and return the new password"""
    if not request.user.is_admin_role:
        return Response(
            {'error': 'Permission denied. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=pk, role='student')
    except User.DoesNotExist:
        return Response(
            {'error': 'Student user not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_password = generate_temp_password()
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Password reset successfully',
        'new_password': new_password,
        'user': AdminUserSerializer(user).data
    })