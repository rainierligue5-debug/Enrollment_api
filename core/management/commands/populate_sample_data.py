"""
Management command to populate the database with sample data for testing.

Usage:
    python manage.py populate_sample_data
"""

from django.core.management.base import BaseCommand
from core.models import Student, Subject, Section, Enrollment


class Command(BaseCommand):
    help = 'Populate database with sample enrollment data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting sample data population...'))

        # Create Subjects
        self.stdout.write('Creating subjects...')
        subjects_data = [
            {'code': 'CS101', 'title': 'Introduction to Programming', 'description': 'Learn the basics of programming using Python', 'units': 4, 'course': 'Computer Science', 'year_level': '1st'},
            {'code': 'CS102', 'title': 'Data Structures', 'description': 'Study fundamental data structures and algorithms', 'units': 4, 'course': 'Computer Science', 'year_level': '2nd'},
            {'code': 'CS201', 'title': 'Web Development', 'description': 'Build web applications with Django and React', 'units': 4, 'course': 'Computer Science', 'year_level': '3rd'},
            {'code': 'CS202', 'title': 'Database Design', 'description': 'Master relational databases and SQL', 'units': 3, 'course': 'Computer Science', 'year_level': '3rd'},
            {'code': 'MATH101', 'title': 'Calculus I', 'description': 'Introduction to differential calculus', 'units': 4, 'course': 'Computer Science', 'year_level': '1st'},
            {'code': 'MATH102', 'title': 'Linear Algebra', 'description': 'Vectors, matrices, and linear transformations', 'units': 3, 'course': 'Computer Science', 'year_level': '2nd'},
        ]

        subjects = {}
        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            if not created:
                # Update existing subject with new data
                for key, value in subject_data.items():
                    setattr(subject, key, value)
                subject.save()
            subjects[subject_data['code']] = subject
            status = 'Created' if created else 'Updated'
            self.stdout.write(f"  {subject_data['code']}: {status}")

        # Create Sections
        self.stdout.write('\nCreating sections...')
        sections_data = [
            # CS101 Sections
            {'subject': subjects['CS101'], 'name': 'A', 'schedule': 'MWF', 'time_start': '09:00:00', 'time_end': '10:30:00', 'room': 'A101', 'max_capacity': 40},
            {'subject': subjects['CS101'], 'name': 'B', 'schedule': 'MWF', 'time_start': '10:45:00', 'time_end': '12:15:00', 'room': 'A102', 'max_capacity': 40},
            {'subject': subjects['CS101'], 'name': 'C', 'schedule': 'TTH', 'time_start': '09:00:00', 'time_end': '10:30:00', 'room': 'B101', 'max_capacity': 35},
            
            # CS102 Sections
            {'subject': subjects['CS102'], 'name': 'A', 'schedule': 'MWF', 'time_start': '13:00:00', 'time_end': '14:30:00', 'room': 'A103', 'max_capacity': 40},
            {'subject': subjects['CS102'], 'name': 'B', 'schedule': 'TTH', 'time_start': '13:00:00', 'time_end': '14:30:00', 'room': 'B102', 'max_capacity': 35},
            
            # CS201 Sections
            {'subject': subjects['CS201'], 'name': 'A', 'schedule': 'MWF', 'time_start': '14:45:00', 'time_end': '16:15:00', 'room': 'C101', 'max_capacity': 30},
            {'subject': subjects['CS201'], 'name': 'B', 'schedule': 'TTH', 'time_start': '14:45:00', 'time_end': '16:15:00', 'room': 'C102', 'max_capacity': 30},
            
            # CS202 Sections
            {'subject': subjects['CS202'], 'name': 'A', 'schedule': 'MWF', 'time_start': '16:30:00', 'time_end': '17:45:00', 'room': 'D101', 'max_capacity': 35},
            
            # MATH101 Sections
            {'subject': subjects['MATH101'], 'name': 'A', 'schedule': 'MWF', 'time_start': '09:00:00', 'time_end': '10:30:00', 'room': 'E101', 'max_capacity': 45},
            {'subject': subjects['MATH101'], 'name': 'B', 'schedule': 'TTH', 'time_start': '10:45:00', 'time_end': '12:15:00', 'room': 'E102', 'max_capacity': 45},
            
            # MATH102 Sections
            {'subject': subjects['MATH102'], 'name': 'A', 'schedule': 'MWF', 'time_start': '13:00:00', 'time_end': '14:15:00', 'room': 'E103', 'max_capacity': 40},
            {'subject': subjects['MATH102'], 'name': 'B', 'schedule': 'TTH', 'time_start': '13:00:00', 'time_end': '14:15:00', 'room': 'F101', 'max_capacity': 40},
        ]

        sections = {}
        for section_data in sections_data:
            section, created = Section.objects.get_or_create(**section_data)
            subject_code = section_data['subject'].code
            section_key = f"{subject_code}-{section_data['name']}"
            sections[section_key] = section
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  {section_key}: {status}")

        # Create Students
        self.stdout.write('\nCreating students...')
        students_data = [
            {'student_id': 'STU001', 'name': 'John Doe', 'email': 'john.doe@example.com', 'course': 'Computer Science', 'year_level': '1st', 'age': 18},
            {'student_id': 'STU002', 'name': 'Jane Smith', 'email': 'jane.smith@example.com', 'course': 'Computer Science', 'year_level': '1st', 'age': 19},
            {'student_id': 'STU003', 'name': 'Bob Johnson', 'email': 'bob.johnson@example.com', 'course': 'Computer Science', 'year_level': '2nd', 'age': 20},
            {'student_id': 'STU004', 'name': 'Alice Brown', 'email': 'alice.brown@example.com', 'course': 'Computer Science', 'year_level': '2nd', 'age': 21},
            {'student_id': 'STU005', 'name': 'Charlie Wilson', 'email': 'charlie.wilson@example.com', 'course': 'Information Technology', 'year_level': '1st', 'age': 18},
            {'student_id': 'STU006', 'name': 'Diana Martinez', 'email': 'diana.martinez@example.com', 'course': 'Information Technology', 'year_level': '1st', 'age': 19},
            {'student_id': 'STU007', 'name': 'Edward Lee', 'email': 'edward.lee@example.com', 'course': 'Computer Science', 'year_level': '3rd', 'age': 22},
            {'student_id': 'STU008', 'name': 'Fiona Garcia', 'email': 'fiona.garcia@example.com', 'course': 'Information Technology', 'year_level': '2nd', 'age': 20},
            {'student_id': 'STU009', 'name': 'George Taylor', 'email': 'george.taylor@example.com', 'course': 'Computer Science', 'year_level': '1st', 'age': 18},
            {'student_id': 'STU010', 'name': 'Hannah Anderson', 'email': 'hannah.anderson@example.com', 'course': 'Information Technology', 'year_level': '3rd', 'age': 22},
        ]

        students = {}
        for student_data in students_data:
            student, created = Student.objects.get_or_create(
                student_id=student_data['student_id'],
                defaults=student_data
            )
            students[student_data['student_id']] = student
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  {student_data['student_id']}: {status}")

        # Create Sample Enrollments
        self.stdout.write('\nCreating sample enrollments...')
        enrollment_specs = [
            # CS101 enrollments
            (students['STU001'], subjects['CS101'], sections['CS101-A']),
            (students['STU002'], subjects['CS101'], sections['CS101-A']),
            (students['STU003'], subjects['CS101'], sections['CS101-A']),
            (students['STU004'], subjects['CS101'], sections['CS101-B']),
            (students['STU005'], subjects['CS101'], sections['CS101-B']),
            (students['STU009'], subjects['CS101'], sections['CS101-C']),
            
            # CS102 enrollments
            (students['STU003'], subjects['CS102'], sections['CS102-A']),
            (students['STU004'], subjects['CS102'], sections['CS102-A']),
            (students['STU007'], subjects['CS102'], sections['CS102-A']),
            
            # CS201 enrollments
            (students['STU007'], subjects['CS201'], sections['CS201-A']),
            (students['STU010'], subjects['CS201'], sections['CS201-A']),
            
            # MATH101 enrollments
            (students['STU001'], subjects['MATH101'], sections['MATH101-A']),
            (students['STU002'], subjects['MATH101'], sections['MATH101-A']),
            (students['STU005'], subjects['MATH101'], sections['MATH101-B']),
            (students['STU006'], subjects['MATH101'], sections['MATH101-B']),
            (students['STU009'], subjects['MATH101'], sections['MATH101-A']),
            
            # MATH102 enrollments
            (students['STU003'], subjects['MATH102'], sections['MATH102-A']),
            (students['STU007'], subjects['MATH102'], sections['MATH102-B']),
            (students['STU010'], subjects['MATH102'], sections['MATH102-B']),
        ]

        enrollment_count = 0
        for student, subject, section in enrollment_specs:
            enrollment, created = Enrollment.objects.get_or_create(
                student=student,
                subject=subject,
                defaults={'section': section, 'status': 'enrolled'}
            )
            if created:
                enrollment_count += 1
                self.stdout.write(f"  {student.name} -> {subject.code} (Section {section.name})")

        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully created {enrollment_count} enrollments'))
        self.stdout.write(self.style.SUCCESS('\n=== Sample Data Statistics ==='))
        self.stdout.write(f'✓ {Subject.objects.count()} subjects created')
        self.stdout.write(f'✓ {Section.objects.count()} sections created')
        self.stdout.write(f'✓ {Student.objects.count()} students created')
        self.stdout.write(f'✓ {Enrollment.objects.count()} enrollments created')
