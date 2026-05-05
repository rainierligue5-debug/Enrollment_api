from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer, AdminUserSerializer, StudentRegistrationSerializer, AdminRegistrationSerializer, generate_temp_password
from core.models import Student

User = get_user_model()


@csrf_exempt
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
            {'error': 'User account is not activated yet. Please check your email for the activation link.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })


@csrf_exempt
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
<<<<<<< HEAD
    if 'profile_picture' in request.FILES:
        user.profile_picture = request.FILES['profile_picture']
=======
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
    
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    
    student = Student.objects.create(
        student_id=data['student_id'],
        name=data['name'],
        email=data['email'],
        course=data['course'],
        year_level=data['year_level'],
        age=data.get('age')
    )
    
    user = User.objects.create(
        email=data['email'],
        name=data['name'],
        role='student',
        student=student,
        is_active=False,
    )
    
    user.set_password(data['password'])
    user.save()
    
    activation_uid = force_str(urlsafe_base64_encode(force_bytes(user.pk)))
    token = default_token_generator.make_token(user)
    activation_link = f"{settings.DJOSER['ACTIVATION_URL'].replace('{uid}', activation_uid).replace('{token}', token)}"
    
    email_subject = 'Activate Your Student Account'
    email_body = f"""
    Hello {user.name},

    Welcome! Please click the link below to activate your student account:

    {activation_link}

    If you did not request this, please ignore this email.

    Thank you,
    USTP Enrollment System
    """
    
    send_mail(
        email_subject,
        email_body,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return Response({
        'message': 'Registration successful. Please check your email to activate your account.',
        'user': {
            'email': user.email,
            'name': user.name,
        },
    }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_admin(request):
    serializer = AdminRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    
    admin_image = request.FILES.get('admin_image')
    
    user = User.objects.create(
        email=data['email'],
        name=data['name'],
        is_active=False,
        role='admin',
    )
    
    user.set_password(data['password'])
    
    if admin_image:
        user.admin_image = admin_image
    
    user.save()
    
    activation_uid = force_str(urlsafe_base64_encode(force_bytes(user.pk)))
    token = default_token_generator.make_token(user)
    activation_link = f"{settings.DJOSER['ACTIVATION_URL'].replace('{uid}', activation_uid).replace('{token}', token)}"
    
    email_subject = 'Activate Your Admin Account'
    email_body = f"""
    Hello {user.name},

    Welcome! Please click the link below to activate your admin account:

    {activation_link}

    If you did not request this, please ignore this email.

    Thank you,
    USTP Enrollment System
    """
    
    send_mail(
        email_subject,
        email_body,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return Response({
        'message': 'Admin registration successful. Please check your email to activate your account.',
        'user': {
            'email': user.email,
            'name': user.name,
        },
    }, status=status.HTTP_201_CREATED)