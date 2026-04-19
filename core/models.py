from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count

class Student(models.Model):
    YEAR_CHOICES = [
        ('1st', '1st Year'),
        ('2nd', '2nd Year'),
        ('3rd', '3rd Year'),
        ('4th', '4th Year'),
    ]

    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=100)
    year_level = models.CharField(max_length=10, choices=YEAR_CHOICES)
    age = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student_id']

    def __str__(self):
        return f"{self.name} ({self.student_id})"

    def get_total_units(self):
        """Calculate total units enrolled for this student"""
        enrollments = self.enrollments.filter(status='enrolled')
        total = enrollments.aggregate(Sum('subject__units'))['subject__units__sum']
        return total or 0

    def get_enrollment_summary(self):
        """Get complete enrollment summary for student"""
        enrollments = self.enrollments.filter(status='enrolled').select_related('subject', 'section')
        return {
            'student': self,
            'enrollments': enrollments,
            'total_units': self.get_total_units(),
            'total_subjects': enrollments.count()
        }


class Subject(models.Model):
    YEAR_CHOICES = [
        ('1st', '1st Year'),
        ('2nd', '2nd Year'),
        ('3rd', '3rd Year'),
        ('4th', '4th Year'),
    ]

    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    units = models.IntegerField()
    course = models.CharField(max_length=100, blank=True)  # e.g., "Computer Science", "Engineering"
    year_level = models.CharField(max_length=10, choices=YEAR_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.title}"


class Section(models.Model):
    SCHEDULE_CHOICES = [
        ('MWF', 'Monday, Wednesday, Friday'),
        ('TTH', 'Tuesday, Thursday'),
        ('DAILY', 'Daily'),
        ('SAT', 'Saturday'),
    ]

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50)
    schedule = models.CharField(max_length=20, choices=SCHEDULE_CHOICES)
    time_start = models.TimeField()
    time_end = models.TimeField()
    room = models.CharField(max_length=50, blank=True)
    max_capacity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subject', 'name')

    def __str__(self):
        return f"{self.subject.code} - {self.name}"

    def get_current_enrollment_count(self):
        """Get number of currently enrolled students in this section"""
        return self.enrollments.filter(status='enrolled').count()

    def has_available_capacity(self):
        """Check if section has available capacity"""
        return self.get_current_enrollment_count() < self.max_capacity

    def get_available_capacity(self):
        """Get remaining capacity"""
        return self.max_capacity - self.get_current_enrollment_count()


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('dropped', 'Dropped'),
        ('completed', 'Completed'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrollments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject')  # Prevents duplicate enrollment for same subject
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['section', 'status']),
        ]

    def __str__(self):
        return f"{self.student.name} - {self.subject.code} ({self.section.name})"

    def clean(self):
        """Validate enrollment constraints"""
        # Check if student already enrolled in this subject
        if Enrollment.objects.filter(
            student=self.student,
            subject=self.subject,
            status='enrolled'
        ).exclude(pk=self.pk).exists():
            raise ValidationError(
                f"Student {self.student.name} is already enrolled in {self.subject.code}"
            )

        # Check if section has capacity
        if not self.section.has_available_capacity():
            raise ValidationError(
                f"Section {self.section.name} has reached maximum capacity"
            )

        # Check if section belongs to the subject
        if self.section.subject != self.subject:
            raise ValidationError(
                f"Section {self.section.name} does not belong to subject {self.subject.code}"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)