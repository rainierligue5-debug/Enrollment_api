from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Student
from user.models import User
import secrets

User = get_user_model()

class Command(BaseCommand):
    help = 'Link orphaned student users to auto-created Student records'

    def handle(self, *args, **options):
        orphaned_users = User.objects.filter(role='student', student__isnull=True).select_related()
        
        if not orphaned_users.exists():
            self.stdout.write(self.style.SUCCESS('No orphaned student users found!'))
            return
        
        self.stdout.write(f'Found {orphaned_users.count()} orphaned student users. Linking...')
        
        for user in orphaned_users:
            student_id = f"STU{secrets.randbelow(1000000):06d}"
            student = Student.objects.create(
                student_id=student_id,
                name=user.name,
                email=user.email,
                course="Undecided",
                year_level="1st"
            )
            user.student = student
            user.save()
            
            self.stdout.write(f'Linked {user.email} -> Student {student_id}')
        
        self.stdout.write(self.style.SUCCESS('All orphaned students linked successfully!'))

