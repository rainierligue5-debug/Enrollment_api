from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet,
    SectionViewSet,
    SubjectViewSet,
    EnrollmentViewSet
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')


urlpatterns = [
    path('enrollments/bulk-enroll/', EnrollmentViewSet.as_view({'post': 'bulk_enroll'}), name='enrollment-bulk-enroll'),
]

urlpatterns += router.urls
