from django.shortcuts import render, get_object_or_404
from django.db.models import Sum, Count, Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission

from .models import Student, Subject, Enrollment, Section
from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    EnrollmentSerializer,
    SectionSerializer,
    EnrollmentSummarySerializer
)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_admin_role or request.user.is_staff


class IsStudentRole(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_student_role


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Student management.
    
    Endpoints:
    - GET /api/students/ - List all students
    - POST /api/students/ - Create new student
    - GET /api/students/{id}/ - Retrieve student details
    - GET /api/students/{id}/enrollment-summary/ - Get enrollment summary
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminRole]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [IsAdminRole()]
        return [IsAdminRole()]

    @action(detail=True, methods=['get'])
    def enrollment_summary(self, request, pk=None):
        student = self.get_object()
        summary = student.get_enrollment_summary()
        
        enrolled_enrollments = Enrollment.objects.filter(
            student=student,
            status='enrolled'
        ).select_related('subject', 'section')
        
        serializer = EnrollmentSummarySerializer({
            'student': student,
            'enrollments': enrolled_enrollments,
            'total_units': summary['total_units'],
            'total_subjects': summary['total_subjects']
        })
        return Response(serializer.data)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subject management.
    
    Endpoints:
    - GET /api/subjects/ - List all subjects
    - POST /api/subjects/ - Create new subject
    - GET /api/subjects/{id}/ - Retrieve subject details
    - GET /api/subjects/{id}/sections/ - Get all sections for subject
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = Subject.objects.all()
        course = self.request.query_params.get('course', None)
        year_level = self.request.query_params.get('year_level', None)
        
        if course:
            queryset = queryset.filter(course__iexact=course)
        if year_level:
            queryset = queryset.filter(year_level=year_level)
        
        return queryset

    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        subject = self.get_object()
        sections = subject.sections.all()
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)


class SectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Section management.
    
    Endpoints:
    - GET /api/sections/ - List all sections
    - POST /api/sections/ - Create new section
    - GET /api/sections/{id}/ - Retrieve section details
    - GET /api/sections/{id}/enrolled-students/ - Get enrolled students in section
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        return [IsAdminRole()]

    @action(detail=True, methods=['get'])
    def enrolled_students(self, request, pk=None):
        section = self.get_object()
        enrollments = Enrollment.objects.filter(
            section=section,
            status='enrolled'
        ).select_related('student')
        
        data = {
            'section': SectionSerializer(section).data,
            'enrollments': EnrollmentSerializer(enrollments, many=True).data,
            'enrollment_count': enrollments.count(),
            'available_capacity': section.get_available_capacity()
        }
        return Response(data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Enrollment management with automatic section assignment.
    
    Endpoints:
    - GET /api/enrollments/ - List all enrollments (admin) or own enrollments (student)
    - POST /api/enrollments/ - Enroll student (admin only)
    - PATCH /api/enrollments/{id}/ - Update enrollment
    - DELETE /api/enrollments/{id}/ - Drop enrollment
    - POST /api/enrollments/bulk-enroll/ - Bulk enroll students (admin only)
    - GET /api/enrollments/my-enrollments/ - Get current user's enrollments (student)
    
    POST Body Example for single enrollment:
    {
        "student_id_write": 1,
        "subject_id_write": 2,
        "section_id_write": 3
    }
    
    POST Body Example for bulk enrollment:
    {
        "enrollments": [
            {"student_id": 1, "subject_id": 2},
            {"student_id": 2, "subject_id": 2}
        ]
    }
    """
    queryset = Enrollment.objects.select_related('student', 'subject', 'section')
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = Enrollment.objects.select_related('student', 'subject', 'section')
        
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            if self.request.user.is_student_role and not self.request.user.is_admin_role:
                if self.request.user.student:
                    queryset = queryset.filter(student=self.request.user.student)
        
        return queryset

    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get enrollments for the logged-in student user"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not request.user.student:
            return Response(
                {'error': 'No linked student account. Please contact administrator.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = Enrollment.objects.filter(
            student=request.user.student,
            status='enrolled'
        ).select_related('subject', 'section')
        
        data = {
            'student': StudentSerializer(request.user.student).data,
            'enrollments': EnrollmentSerializer(enrollments, many=True).data,
            'total_units': request.user.student.get_total_units(),
            'total_subjects': enrollments.count()
        }
        return Response(data)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        if 'student_id' in data and 'student_id_write' not in data:
            data['student_id_write'] = data.pop('student_id')
        if 'subject_id' in data and 'subject_id_write' not in data:
            data['subject_id_write'] = data.pop('subject_id')
        if 'section_id' in data and 'section_id_write' not in data:
            data['section_id_write'] = data.pop('section_id')

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {'error': str(e.detail)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_enroll(self, request):
        enrollments_data = request.data.get('enrollments', [])
        
        if not enrollments_data:
            return Response(
                {'error': 'No enrollments provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        successful_enrollments = []
        failed_enrollments = []

        for enrollment_data in enrollments_data:
            try:
                student_id = enrollment_data.get('student_id')
                subject_id = enrollment_data.get('subject_id')
                section_id = enrollment_data.get('section_id')

                student = get_object_or_404(Student, id=student_id)
                subject = get_object_or_404(Subject, id=subject_id)

                if Enrollment.objects.filter(
                    student=student,
                    subject=subject,
                    status='enrolled'
                ).exists():
                    failed_enrollments.append({
                        'student_id': student_id,
                        'subject_id': subject_id,
                        'error': f'Student already enrolled in {subject.code}'
                    })
                    continue

                if not section_id:
                    available_section = next(
                        (s for s in subject.sections.all() if s.has_available_capacity()),
                        None
                    )
                    if not available_section:
                        failed_enrollments.append({
                            'student_id': student_id,
                            'subject_id': subject_id,
                            'error': f'No available sections for {subject.code}'
                        })
                        continue
                    section_id = available_section.id
                else:
                    section = get_object_or_404(Section, id=section_id)
                    if not section.has_available_capacity():
                        failed_enrollments.append({
                            'student_id': student_id,
                            'subject_id': subject_id,
                            'error': f'Section {section.name} has reached capacity'
                        })
                        continue

                enrollment = Enrollment.objects.create(
                    student_id=student_id,
                    subject_id=subject_id,
                    section_id=section_id,
                    status='enrolled'
                )
                successful_enrollments.append(
                    EnrollmentSerializer(enrollment).data
                )

            except Exception as e:
                failed_enrollments.append({
                    'data': enrollment_data,
                    'error': str(e)
                })

        return Response({
            'successful': successful_enrollments,
            'failed': failed_enrollments,
            'summary': {
                'total': len(enrollments_data),
                'successful': len(successful_enrollments),
                'failed': len(failed_enrollments)
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def drop(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.status == 'dropped':
            return Response(
                {'error': 'Enrollment already dropped'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'dropped'
        enrollment.save()
        return Response(
            {
                'message': 'Enrollment dropped successfully',
                'enrollment': EnrollmentSerializer(enrollment).data
            },
            status=status.HTTP_200_OK
        )