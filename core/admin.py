from django.contrib import admin
from .models import Student, Subject, Section, Enrollment


class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'email', 'course', 'year_level')
    search_fields = ('student_id', 'name', 'email', 'course')
    list_filter = ('year_level', 'course', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Personal Information', {
            'fields': ('student_id', 'name', 'email', 'age')
        }),
        ('Academic Information', {
            'fields': ('course', 'year_level')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'units')
    search_fields = ('code', 'title')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Subject Information', {
            'fields': ('code', 'title', 'units')
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


class SectionInline(admin.TabularInline):
    model = Section
    extra = 1
    fields = ('name', 'schedule', 'time_start', 'time_end', 'room', 'max_capacity')


class SectionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'schedule', 'time_start', 'time_end', 'current_enrollment_display', 'max_capacity')
    list_filter = ('subject', 'schedule')
    search_fields = ('subject__code', 'name')
    readonly_fields = ('created_at', 'get_enrollment_count', 'get_available_capacity')
    
    fieldsets = (
        ('Section Information', {
            'fields': ('subject', 'name', 'max_capacity')
        }),
        ('Schedule', {
            'fields': ('schedule', 'time_start', 'time_end', 'room')
        }),
        ('Capacity Information', {
            'fields': ('get_enrollment_count', 'get_available_capacity'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def current_enrollment_display(self, obj):
        return f"{obj.get_current_enrollment_count()}/{obj.max_capacity}"
    current_enrollment_display.short_description = 'Enrollment'
    
    def get_enrollment_count(self, obj):
        return obj.get_current_enrollment_count()
    get_enrollment_count.short_description = 'Current Enrollment Count'
    
    def get_available_capacity(self, obj):
        return obj.get_available_capacity()
    get_available_capacity.short_description = 'Available Capacity'


class EnrollmentInline(admin.TabularInline):
    model = Enrollment
    extra = 1
    fields = ('student', 'subject', 'section', 'status')


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'section', 'status', 'enrolled_at')
    list_filter = ('status', 'enrolled_at', 'subject')
    search_fields = ('student__name', 'student__student_id', 'subject__code')
    readonly_fields = ('enrolled_at', 'updated_at')
    date_hierarchy = 'enrolled_at'
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('student', 'subject', 'section', 'status')
        }),
        ('Timestamps', {
            'fields': ('enrolled_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'subject', 'section')


# Register models
admin.site.register(Student, StudentAdmin)
admin.site.register(Subject, SubjectAdmin)
admin.site.register(Section, SectionAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)
