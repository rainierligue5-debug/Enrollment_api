from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from core.models import Student
import secrets
import string

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    student_id = serializers.SerializerMethodField()
    student_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'student', 'student_id', 'student_info', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_student_id(self, obj):
        if obj.student:
            return obj.student.student_id
        return None

    def get_student_info(self, obj):
        if obj.student:
            return {
                'student_id': obj.student.student_id,
                'name': obj.student.name,
                'email': obj.student.email,
                'course': obj.student.course,
                'year_level': obj.student.year_level,
                'age': obj.student.age,
            }
        return None


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin to view and manage user passwords"""
    student_id = serializers.SerializerMethodField()
    student_info = serializers.SerializerMethodField()
    temp_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'student', 'student_id', 'student_info', 'is_active', 'date_joined', 'temp_password']
        read_only_fields = ['id', 'date_joined']

    def get_student_id(self, obj):
        if obj.student:
            return obj.student.student_id
        return None

    def get_student_info(self, obj):
        if obj.student:
            return {
                'student_id': obj.student.student_id,
                'name': obj.student.name,
                'email': obj.student.email,
                'course': obj.student.course,
                'year_level': obj.student.year_level,
                'age': obj.student.age,
            }
        return None

    def get_temp_password(self, obj):
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    student_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'role', 'student', 'student_id']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        student_id = validated_data.pop('student_id', None)
        
        student = None
        if student_id:
            try:
                student = Student.objects.get(student_id=student_id)
            except Student.DoesNotExist:
                pass
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        if student:
            user.student = student
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    class Meta:
        fields = ['email', 'password']


def generate_temp_password(length=12):
    """Generate a random password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))