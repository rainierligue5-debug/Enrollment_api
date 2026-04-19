from rest_framework import serializers
from django.db.models import Count, Q
from .models import Student, Section, Subject, Enrollment


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for Subject model"""
    class Meta:
        model = Subject
        fields = ['id', 'code', 'title', 'description', 'units', 'course', 'year_level', 'created_at']
        read_only_fields = ['created_at']


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model with capacity information"""
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    current_enrollment = serializers.SerializerMethodField()
    available_capacity = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            'id', 'subject', 'subject_id', 'name', 'schedule', 
            'time_start', 'time_end', 'room', 'max_capacity',
            'current_enrollment', 'available_capacity', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_current_enrollment(self, obj):
        """Get current enrollment count"""
        return obj.get_current_enrollment_count()

    def get_available_capacity(self, obj):
        """Get available capacity"""
        return obj.get_available_capacity()


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model with nested details"""
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    subject = SubjectSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    
    # For creation, accept IDs
    student_id_write = serializers.IntegerField(write_only=True, required=False)
    subject_id_write = serializers.IntegerField(write_only=True, required=False)
    section_id_write = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student_id', 'student_name', 'student_id_write',
            'subject', 'subject_id_write',
            'section', 'section_id_write',
            'status', 'enrolled_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'updated_at']

    def create(self, validated_data):
        """Create enrollment with automatic section assignment"""
        # Replace ID fields with actual objects
        if 'student_id_write' in validated_data:
            validated_data['student_id'] = validated_data.pop('student_id_write')
        if 'subject_id_write' in validated_data:
            validated_data['subject_id'] = validated_data.pop('subject_id_write')
        
        # If section_id is provided, use it; otherwise, auto-assign
        if 'section_id_write' not in validated_data or not validated_data.get('section_id_write'):
            # Auto-assign to section with available capacity
            subject = Subject.objects.get(id=validated_data['subject_id'])
            
            # Try to find a section with available capacity
            available_section = next(
                (s for s in subject.sections.all() if s.has_available_capacity()),
                None
            )
            
            if not available_section:
                raise serializers.ValidationError(
                    f"No available sections for subject {subject.code}"
                )
            validated_data['section'] = available_section
        else:
            validated_data['section_id'] = validated_data.pop('section_id_write')

        return super().create(validated_data)


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model with enrollment summary"""
    total_units = serializers.SerializerMethodField()
    total_subjects = serializers.SerializerMethodField()
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'name', 'email', 'course', 
            'year_level', 'age', 'total_units', 'total_subjects',
            'enrollments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'enrollments']

    def get_total_units(self, obj):
        """Get total units for this student"""
        return obj.get_total_units()

    def get_total_subjects(self, obj):
        """Get total subjects enrolled"""
        return obj.enrollments.filter(status='enrolled').count()


class EnrollmentSummarySerializer(serializers.Serializer):
    """Serializer for enrollment summary"""
    student = StudentSerializer()
    enrollments = EnrollmentSerializer(many=True)
    total_units = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
