"""
Management command to create test user accounts.

Usage:
    python manage.py create_test_users
"""

from django.core.management.base import BaseCommand
from user.models import User
from core.models import Student


class Command(BaseCommand):
    help = 'Create test user accounts (admin and student)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating test users...'))

        admin_email = 'admin@admin.edu'
        admin_created = False
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_user(
                email=admin_email,
                name='System Administrator',
                password='admin123',
                role='admin',
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(self.style.SUCCESS(f'Admin created: {admin_email} / admin123'))
            admin_created = True
        else:
            self.stdout.write(f'Admin already exists: {admin_email}')

        student_emails = [
            ('student@ustp.edu', 'student123', 'STU001', 'John Doe'),
            ('jane.smith@example.com', 'student123', 'STU002', 'Jane Smith'),
            ('bob.johnson@example.com', 'student123', 'STU003', 'Bob Johnson'),
        ]

        for email, password, student_id, name in student_emails:
            student = None
            try:
                student = Student.objects.get(student_id=student_id)
            except Student.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Student {student_id} not found, creating user without link'))

            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    name=name,
                    password=password,
                    role='student',
                    student=student,
                )
                status = 'Created' if student else 'Created (no student link)'
                self.stdout.write(self.style.SUCCESS(f'{status}: {email} / {password} (linked to {student_id})'))
            else:
                self.stdout.write(f'Student user already exists: {email}')

        self.stdout.write(self.style.SUCCESS('\n=== Test Users Created ==='))
        self.stdout.write(f'Admin: {admin_email} / admin123')
        self.stdout.write(f'Student: student@ustp.edu / student123 (linked to STU001)')