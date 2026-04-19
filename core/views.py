from django.shortcuts import render, get_object_or_404
from django.db.models import Sum, Count, Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import Student, Subject, Enrollment, Section
from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    EnrollmentSerializer,
    SectionSerializer,
    EnrollmentSummarySerializer
)


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

    @action(detail=True, methods=['get'])
    def enrollment_summary(self, request, pk=None):
        """
        Get enrollment summary for a specific student.
        Returns student details, enrolled subjects, total units, and section info.
        """
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
    - GET /api/subjects/ - List all subjects (with optional course/year_level filters)
    - POST /api/subjects/ - Create new subject
    - GET /api/subjects/{id}/ - Retrieve subject details
    - GET /api/subjects/{id}/sections/ - Get all sections for subject
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_queryset(self):
        """Filter subjects by course and year_level if provided"""
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
        """Get all sections for a specific subject"""
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

    @action(detail=True, methods=['get'])
    def enrolled_students(self, request, pk=None):
        """Get list of enrolled students in a section"""
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
    - GET /api/enrollments/ - List all enrollments
    - POST /api/enrollments/ - Enroll student (with auto section assignment)
    - PATCH /api/enrollments/{id}/ - Update enrollment (change status, etc.)
    - DELETE /api/enrollments/{id}/ - Drop enrollment
    - POST /api/enrollments/bulk-enroll/ - Bulk enroll students
    
    POST Body Example for single enrollment:
    {
        "student_id_write": 1,
        "subject_id_write": 2,
        "section_id_write": 3  // Optional - will auto-assign if not provided
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
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Create enrollment with automatic section assignment and validation"""
        data = request.data.copy()
        
        # Handle renaming of fields for consistency
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
        """
        Bulk enroll multiple students in subjects.
        
        POST Body:
        {
            "enrollments": [
                {"student_id": 1, "subject_id": 2},
                {"student_id": 2, "subject_id": 3}
            ]
        }
        """
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

                # Validate student and subject exist
                student = get_object_or_404(Student, id=student_id)
                subject = get_object_or_404(Subject, id=subject_id)

                # Check for duplicate enrollment
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

                # Auto-assign section if not provided
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

                # Create enrollment
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
        """
        Drop an enrollment (mark as dropped).
        
        POST endpoint with no body required.
        """
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

