#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_api.settings')
django.setup()

from core.models import Enrollment, Student, Subject, Section

# Get enrollment statistics
total = Enrollment.objects.count()
enrolled = Enrollment.objects.filter(status='enrolled').count()
dropped = Enrollment.objects.filter(status='dropped').count()

print(f'Total Enrollments: {total}')
print(f'Enrolled: {enrolled}')
print(f'Dropped: {dropped}')
print()

# Check for data integrity
enrollments_with_nulls = Enrollment.objects.filter(student_id__isnull=True) | \
                         Enrollment.objects.filter(subject_id__isnull=True) | \
                         Enrollment.objects.filter(section_id__isnull=True)

print('Data Integrity Check:')
if enrollments_with_nulls.exists():
    print(f'ERROR: {enrollments_with_nulls.count()} enrollments with NULL values!')
else:
    print('✓ All enrollments have valid student, subject, and section')

# Verify referential integrity
print()
print('Referential Integrity Check:')

# Check if all student_ids exist
orphaned_students = Enrollment.objects.exclude(
    student_id__in=Student.objects.values_list('id', flat=True)
)
if orphaned_students.exists():
    print(f'ERROR: {orphaned_students.count()} enrollments with non-existent students!')
else:
    print('✓ All student references are valid')

# Check if all subject_ids exist
orphaned_subjects = Enrollment.objects.exclude(
    subject_id__in=Subject.objects.values_list('id', flat=True)
)
if orphaned_subjects.exists():
    print(f'ERROR: {orphaned_subjects.count()} enrollments with non-existent subjects!')
else:
    print('✓ All subject references are valid')

# Check if all section_ids exist
orphaned_sections = Enrollment.objects.exclude(
    section_id__in=Section.objects.values_list('id', flat=True)
)
if orphaned_sections.exists():
    print(f'ERROR: {orphaned_sections.count()} enrollments with non-existent sections!')
else:
    print('✓ All section references are valid')

# Check for invalid status values
print()
print('Status Validation:')
invalid_statuses = Enrollment.objects.exclude(status__in=['enrolled', 'dropped', 'completed'])
if invalid_statuses.exists():
    print(f'ERROR: {invalid_statuses.count()} enrollments with invalid status!')
    for e in invalid_statuses[:5]:
        print(f'  ID={e.id} | Status={e.status}')
else:
    print('✓ All enrollments have valid status (enrolled/dropped/completed)')

# Sample recent enrollments
print()
print('Recent 3 Enrollments:')
recent = Enrollment.objects.select_related('student', 'subject', 'section').order_by('-id')[:3]
for e in recent:
    print(f'  ID={e.id} | {e.student.student_id} → {e.subject.code}-{e.section.name} | {e.status}')

print()
print('✓ Data integrity verification complete')
