# Student Enrollment & Sectioning System

A comprehensive Django REST API + React web application for managing student enrollments with automatic section assignment and capacity controls.

## 🎯 System Overview

This system enables educational institutions to efficiently manage student enrollments in subjects with automatic section assignment, capacity controls, and comprehensive enrollment tracking.

### Core Features
- ✅ **Student Management**: Add, view, update, and manage student records
- ✅ **Subject Management**: Create and manage academic subjects with unit values
- ✅ **Section Management**: Create class sections with schedules, capacity limits, and room assignments
- ✅ **Enrollment Management**: Enroll students in subjects with automatic section assignment
- ✅ **Bulk Enrollment**: Process multiple enrollments simultaneously
- ✅ **Capacity Control**: Enforce maximum students per section
- ✅ **Enrollment Summary**: Track student progress and unit calculations
- ✅ **Email Activation**: Self-registered accounts require email verification before login
- ✅ **Admin Registration with Image Upload**: Admins can self-register with Cloudinary-hosted profile images
- ✅ **Password Reset**: Users can request password reset via email
- ✅ **Role-Based Access**: Separate Admin and Student portals with protected routes

### Backend Dependencies
- **cloudinary** + **django-cloudinary-storage**: Cloud-based media storage for admin profile images
- **Pillow**: Image processing for Django ImageField
- **djoser**: Authentication endpoints (login, activation, password reset)
- **djangorestframework-simplejwt**: JWT token authentication
- **python-dotenv**: Environment variable loading from `.env`

### Frontend Dependencies
- **lucide-react**: Icon library for UI components
- **react-router-dom**: Client-side routing with protected routes

### 📧 Authentication & Account Features

#### Role-Based Registration

| Feature | Student | Admin |
|---------|---------|-------|
| Self-Registration | ✅ `/register` (toggle "Student") | ✅ `/register` (toggle "Admin") |
| Email Activation | ✅ Required | ✅ Required |
| Profile Image | ❌ | ✅ Optional (Cloudinary) |
| Student ID Required | ✅ | ❌ |
| Course/Year Required | ✅ | ❌ |

#### Email Activation Flow

```
User registers via /register (Student or Admin toggle)
         ↓
Backend creates User (is_active=False) + Student record (if student)
         ↓
Activation email sent with link (or printed to console if SMTP not configured)
         ↓
User clicks: http://localhost:3000/activate/{uid}/{token}
         ↓
Account activated (is_active=True) → redirected to Login
```

> **Note**: If SMTP credentials are placeholders, activation links are printed to the Django console. Check the terminal running `python manage.py runserver`.

#### Password Reset Flow

```
User visits /password-reset → enters email
         ↓
Reset email sent with link (or printed to console)
         ↓
User clicks: http://localhost:3000/password-reset/confirm/{uid}/{token}
         ↓
User sets new password → redirected to Login
```

#### Resend Activation

```
User visits /activate (without valid link) → enters email
         ↓
New activation email sent (or printed to console)
```

### 🖼️ Cloudinary Setup

Admin profile images are uploaded to Cloudinary. Configure your credentials in `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Sign up at https://cloudinary.com to get free tier credentials.

### 🔐 Admin Password Management

Admins can manage student user accounts and reset passwords:

```bash
# Reset password for student user ID 2
POST /api/users/students/2/reset-password/
Authorization: Bearer <admin_token>

# Returns:
{
  "message": "Password reset successfully",
  "new_password": "xK9mP2vL4nQ8",
  "user": { ... }
}
```

## 🔐 Authentication & User Roles

### User Roles
- **Administrator** (`admin`): Full CRUD access to all endpoints (students, subjects, sections, enrollments, user management)
- **Student** (`student`): View-only access to their own enrollments and subjects/sections

### Custom User Model

The system uses a custom `User` model (`user.User`) instead of Django's default `auth.User`:

| Field | Type | Description |
|-------|------|-------------|
| `email` | EmailField (unique) | Login identifier |
| `name` | CharField | Display name |
| `role` | CharField | `admin` or `student` |
| `student` | OneToOneField (nullable) | Linked Student record |
| `admin_image` | ImageField (nullable) | Admin profile image (Cloudinary) |
| `is_active` | BooleanField | Account activation status |
| `is_staff` | BooleanField | Django admin access |
| `date_joined` | DateTimeField | Account creation timestamp |

### Login Endpoint
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "admin@admin.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "email": "admin@admin.edu",
    "name": "System Administrator",
    "role": "admin",
    "student": null,
    "admin_image": null,
    "is_active": true
  }
}
```

### Student Self-Registration (Public)
```
POST /api/auth/register/
Content-Type: application/json

{
  "student_id": "2024001",
  "name": "New Student",
  "email": "newstudent@ustp.edu",
  "course": "Computer Science",
  "year_level": "1st",
  "age": 18,
  "password": "mypassword123",
  "re_password": "mypassword123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to activate your account.",
  "user": {
    "email": "newstudent@ustp.edu",
    "name": "New Student"
  }
}
```

### Admin Self-Registration with Image Upload (Public)
```
POST /api/auth/register-admin/
Content-Type: multipart/form-data

name: "Admin Name"
email: "admin@example.com"
password: "securepassword123"
re_password: "securepassword123"
admin_image: <file>  (optional)
```

**Response:**
```json
{
  "message": "Admin registration successful. Please check your email to activate your account.",
  "user": {
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```

### Email Activation (Public)
```
POST /api/auth/users/activation/
Content-Type: application/json

{
  "uid": "encoded_uid",
  "token": "activation_token"
}
```

### Resend Activation Email (Public)
```
POST /api/auth/users/resend_activation/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Password Reset Request (Public)
```
POST /api/auth/users/reset_password/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Password Reset Confirm (Public)
```
POST /api/auth/users/reset_password_confirm/
Content-Type: application/json

{
  "uid": "encoded_uid",
  "token": "reset_token",
  "new_password": "newpassword123",
  "re_new_password": "newpassword123"
}
```

**Backend URL**: http://127.0.0.1:8000

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend URL**: http://localhost:3000

### 🔐 Email & SMTP Setup (Required for Activation)

The system uses email activation for self-registered students. To enable email sending:

#### Option 1: Gmail SMTP (Recommended)

1. **Enable 2-Step Verification** on your Google account: https://myaccount.google.com/security
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select **Mail** as the app and your device
   - Click **Generate** and copy the 16-character password
3. **Edit `.env`** with your credentials:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=abcdefghijklmnop
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

#### Option 2: Other SMTP Providers

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Outlook/Hotmail | smtp-mail.outlook.com | 587 | Use your account password |
| Yahoo | smtp.mail.yahoo.com | 587 | Use an App Password |
| SendGrid | smtp.sendgrid.net | 587 | API key as password |

#### Option 3: Console Backend (Development Only)

If no SMTP credentials are configured, emails are printed to the Django console output. This is useful for testing without a real email account. Check the terminal where `python manage.py runserver` is running to see activation links.

### 📧 Email Activation Flow

```
Student registers via /register
        ↓
Backend creates Student + User (is_active=False)
        ↓
Activation email sent with link
        ↓
Student clicks: http://localhost:3000/activate/{uid}/{token}
        ↓
Account activated + auto-login → redirected to /student
```

**Admin-created accounts**: Accounts created by admins through "Student Accounts" are immediately active — no email activation required.

## 📋 System Walkthrough & Features Guide

### 1. Student Management

#### Adding Students
1. Navigate to the **Students** page
2. Click **"Add New Student"**
3. Fill required fields:
   - **Student ID**: Unique identifier (e.g., "2021001")
   - **Name**: Full student name
   - **Email**: Unique email address
   - **Course**: Program of study (e.g., "Computer Science")
   - **Year Level**: 1st, 2nd, 3rd, or 4th year
   - **Age**: Optional numeric value

#### Student Constraints
- **Unique Fields**: Student ID and Email must be unique across all students
- **Required Fields**: Student ID, Name, Email, Course, and Year Level are mandatory
- **Data Validation**: Email format validation and age limits (if provided)

#### Student Features
- **Enrollment Summary**: View total enrolled units and subjects per student
- **Real-time Updates**: Automatic calculation of enrolled units
- **Search & Filter**: Find students by ID, name, or course

### 2. Subject Management

#### Creating Subjects
1. Navigate to the **Subjects** page
2. Click **"Add New Subject"**
3. Fill required fields:
   - **Code**: Unique subject code (e.g., "CS101", "MATH201")
   - **Title**: Full subject name
   - **Description**: Optional detailed description
   - **Units**: Credit units (numeric value)

#### Subject Constraints
- **Unique Code**: Subject codes must be unique
- **Required Fields**: Code, Title, and Units are mandatory
- **Units Validation**: Must be positive integer

### 3. Section Management

#### Creating Sections
1. Navigate to the **Sections** page
2. Click **"Add New Section"**
3. Fill required fields:
   - **Subject**: Select from existing subjects
   - **Name**: Section identifier (e.g., "A", "B", "Track1")
   - **Schedule**: MWF, TTH, Daily, or Saturday
   - **Time Start/End**: Class timing
   - **Room**: Optional room assignment
   - **Max Capacity**: Maximum number of students

#### Section Constraints
- **Unique Combination**: Subject + Name must be unique
- **Capacity Limits**: Maximum capacity enforced during enrollment
- **Subject Association**: Sections belong to specific subjects only

#### Section Features
- **Capacity Tracking**: Real-time display of enrolled vs. available capacity
- **Automatic Assignment**: System selects available sections during enrollment
- **Schedule Management**: Multiple schedule options for flexible class planning

### 4. Enrollment Management

#### Single Student Enrollment
1. Navigate to the **Enrollments** page
2. Click **"Enroll Student"**
3. Select Student and Subject
4. Optionally specify Section (auto-assigned if not selected)
5. System validates and creates enrollment

#### Bulk Enrollment
1. Click **"Bulk Enroll Students"**
2. Add multiple student-subject combinations
3. System processes all enrollments simultaneously
4. View success/failure summary with detailed error messages

#### Enrollment Status Management
- **Enrolled**: Active enrollment status
- **Dropped**: Student withdrew from subject
- **Completed**: Student finished the subject

### 5. Business Rules & System Constraints

#### Enrollment Validation Rules
1. **Duplicate Prevention**: Students cannot enroll in the same subject twice
2. **Capacity Enforcement**: Sections cannot exceed maximum capacity
3. **Section-Subject Matching**: Enrollments must use sections belonging to the selected subject
4. **Data Integrity**: All foreign key relationships maintained

#### Automatic Features
1. **Section Assignment**: System automatically selects available sections
2. **Capacity Checking**: Real-time validation of section availability
3. **Unit Calculation**: Automatic computation of total enrolled units
4. **Status Tracking**: Comprehensive enrollment status management

#### Error Handling
- **Validation Errors**: Clear messages for constraint violations
- **Capacity Errors**: Specific messages when sections are full
- **Duplicate Errors**: Prevention of double enrollment attempts
- **Network Errors**: Graceful handling of API failures

## 🔐 Authentication & User Roles

### User Roles
- **Administrator** (`admin`): Full CRUD access to all endpoints (students, subjects, sections, enrollments)
- **Student** (`student`): View-only access to their own enrollments

### Login Endpoint
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "admin@admin.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "email": "admin@admin.edu",
    "name": "System Administrator",
    "role": "admin",
    "student": null
  }
}
```

### Student Registration (Public)
```
POST /api/auth/register/
Content-Type: application/json

{
  "student_id": "2024001",
  "name": "New Student",
  "email": "newstudent@ustp.edu",
  "course": "Computer Science",
  "year_level": "1st",
  "age": 18,
  "password": "mypassword123",
  "re_password": "mypassword123"
}
```

### Email Activation
```
POST /api/auth/users/activation/
Content-Type: application/json

{
  "uid": "encoded_uid",
  "token": "activation_token"
}
```

### Resend Activation Email
```
POST /api/auth/users/resend_activation/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Password Reset Request
```
POST /api/auth/users/reset_password/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Password Reset Confirm
```
POST /api/auth/users/reset_password_confirm/
Content-Type: application/json

{
  "uid": "encoded_uid",
  "token": "reset_token",
  "new_password": "newpassword123",
  "re_new_password": "newpassword123"
}
```

### Get Current User
```
GET /api/auth/me/
Authorization: Bearer <access_token>
```

### My Enrollments (Student)
```
GET /api/enrollments/my_enrollments/
Authorization: Bearer <access_token>
```
Returns the logged-in student's enrollments, subjects, sections, and total units.

### Student Users Management (Admin Only)
```
GET    /api/users/students/                    # List all student login accounts
POST   /api/users/students/                    # Create new student user
GET    /api/users/students/{id}/               # Get student user details
PATCH  /api/users/students/{id}/               # Update student user
DELETE /api/users/students/{id}/               # Delete student user
POST   /api/users/students/{id}/reset_password/  # Reset password (returns new password)
```

### Logout
```
POST /api/auth/logout/
```
No authentication required (clears token on frontend).

## 🧪 Testing Credentials

### Create Test Users
```bash
python manage.py create_test_users
```

### Test Accounts

| Role | Email | Password | Description |
|------|------|----------|--------------|
| Admin | admin@admin.edu | admin123 | Full system access |
| Student | student@ustp.edu | student123 | View own enrollments (linked to STU001) |

## 🔧 API Documentation

#### Students
```
GET    /api/students/                    # List all students
POST   /api/students/                    # Create new student
GET    /api/students/{id}/               # Get student details
PUT    /api/students/{id}/               # Update student
DELETE /api/students/{id}/               # Delete student
GET    /api/students/{id}/enrollment_summary/  # Get enrollment summary
```

#### Subjects
```
GET    /api/subjects/                    # List all subjects
POST   /api/subjects/                    # Create new subject
GET    /api/subjects/{id}/               # Get subject details
PUT    /api/subjects/{id}/               # Update subject
DELETE /api/subjects/{id}/               # Delete subject
GET    /api/subjects/{id}/sections/      # Get subject sections
```

#### Sections
```
GET    /api/sections/                    # List all sections
POST   /api/sections/                    # Create new section
GET    /api/sections/{id}/               # Get section details
PUT    /api/sections/{id}/               # Update section
DELETE /api/sections/{id}/               # Delete section
GET    /api/sections/{id}/enrolled-students/  # Get enrolled students
```

#### Enrollments
```
GET    /api/enrollments/                 # List all enrollments
POST   /api/enrollments/                 # Create single enrollment
GET    /api/enrollments/{id}/            # Get enrollment details
PUT    /api/enrollments/{id}/            # Update enrollment
DELETE /api/enrollments/{id}/            # Delete enrollment
POST   /api/enrollments/bulk-enroll/     # Bulk enrollment
POST   /api/enrollments/{id}/drop/       # Drop enrollment
```

### API Access Rules

| Endpoint | Admin | Student | Anonymous |
|----------|-------|---------|-----------|
| **Authentication** | | | |
| POST /api/auth/login/ | ✓ | ✓ | ✓ |
| POST /api/auth/logout/ | ✓ | ✓ | ✓ |
| POST /api/auth/register/ | ✗ | ✗ | ✓ (Student registration) |
| POST /api/auth/register-admin/ | ✗ | ✗ | ✓ (Admin registration + image) |
| POST /api/auth/users/activation/ | ✗ | ✗ | ✓ |
| POST /api/auth/users/resend_activation/ | ✗ | ✗ | ✓ |
| POST /api/auth/users/reset_password/ | ✗ | ✗ | ✓ |
| POST /api/auth/users/reset_password_confirm/ | ✗ | ✗ | ✓ |
| GET /api/auth/me/ | ✓ | ✓ | ✗ |
| PATCH /api/auth/me/ | ✓ | ✓ | ✗ |
| **Students** | | | |
| GET /api/students/ | ✓ | ✗ | ✗ |
| POST /api/students/ | ✓ | ✗ | ✗ |
| GET /api/students/{id}/ | ✓ | ✗ | ✗ |
| GET /api/students/{id}/enrollment-summary/ | ✓ | ✗ | ✗ |
| PUT/DELETE /api/students/{id}/ | ✓ | ✗ | ✗ |
| **Subjects** | | | |
| GET /api/subjects/ | ✓ | ✓ | ✗ |
| POST /api/subjects/ | ✓ | ✗ | ✗ |
| GET /api/subjects/{id}/sections/ | ✓ | ✓ | ✗ |
| PUT/DELETE /api/subjects/{id}/ | ✓ | ✗ | ✗ |
| **Sections** | | | |
| GET /api/sections/ | ✓ | ✓ | ✗ |
| POST /api/sections/ | ✓ | ✗ | ✗ |
| GET /api/sections/{id}/enrolled-students/ | ✓ | ✓ | ✗ |
| PUT/DELETE /api/sections/{id}/ | ✓ | ✗ | ✗ |
| **Enrollments** | | | |
| GET /api/enrollments/ | ✓ (all) | ✓ (own only) | ✗ |
| POST /api/enrollments/ | ✓ | ✗ | ✗ |
| POST /api/enrollments/bulk-enroll/ | ✓ | ✗ | ✗ |
| GET /api/enrollments/my_enrollments/ | ✗ | ✓ | ✗ |
| POST /api/enrollments/{id}/drop/ | ✓ | ✗ | ✗ |
| **User Management** | | | |
| GET /api/users/students/ | ✓ | ✗ | ✗ |
| POST /api/users/students/ | ✓ | ✗ | ✗ |
| GET/PATCH/DELETE /api/users/students/{id}/ | ✓ | ✗ | ✗ |
| POST /api/users/students/{id}/reset_password/ | ✓ | ✗ | ✗ |

### Sample API Requests

#### Self-Registration (Student)
```json
POST /api/auth/register/
{
  "student_id": "2024001",
  "name": "Jane Smith",
  "email": "jane@ustp.edu",
  "course": "Computer Science",
  "year_level": "1st",
  "age": 18,
  "password": "mypassword123",
  "re_password": "mypassword123"
}
```

#### Self-Registration (Admin with Image)
```
POST /api/auth/register-admin/
Content-Type: multipart/form-data

name: "Admin User"
email: "admin@example.com"
password: "securepass123"
re_password: "securepass123"
admin_image: <image_file>  (optional)
```

#### Create Student
```json
POST /api/students/
{
  "student_id": "2021001",
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "course": "Computer Science",
  "year_level": "1st",
  "age": 18
}
```

#### Create Subject
```json
POST /api/subjects/
{
  "code": "CS101",
  "title": "Introduction to Programming",
  "description": "Basic programming concepts",
  "units": 3
}
```

#### Create Section
```json
POST /api/sections/
{
  "subject_id": 1,
  "name": "A",
  "schedule": "MWF",
  "time_start": "08:00:00",
  "time_end": "10:00:00",
  "room": "Room 101",
  "max_capacity": 30
}
```

#### Single Enrollment
```json
POST /api/enrollments/
{
  "student_id_write": 1,
  "subject_id_write": 1,
  "section_id_write": 1
}
```

#### Bulk Enrollment
```json
POST /api/enrollments/bulk-enroll/
{
  "enrollments": [
    {"student_id": 1, "subject_id": 1},
    {"student_id": 2, "subject_id": 2}
  ]
}
```

#### Reset Student Password (Admin)
```json
POST /api/users/students/2/reset_password/
Authorization: Bearer <admin_token>
```
Returns:
```json
{
  "message": "Password reset successfully",
  "new_password": "xK9mP2vL4nQ8",
  "user": { ... }
}
```

## 🎨 User Interface Features

### Dashboard
- **Statistics Overview**: Total students, subjects, sections, and enrollments
- **Quick Navigation**: Direct links to all management pages
- **Real-time Data**: Live counts updated after operations

### Data Tables
- **Sorting & Filtering**: Organize data by any column
- **Search Functionality**: Find records quickly
- **Pagination**: Handle large datasets efficiently
- **Action Buttons**: Edit, delete, and status change options

### Forms
- **Validation Feedback**: Real-time field validation
- **Dropdown Selections**: Smart filtering of related data
- **Bulk Operations**: Add multiple items simultaneously
- **Success/Error Messages**: Clear feedback for all operations

### Responsive Design
- **Mobile-Friendly**: Works on all device sizes
- **Clean Layout**: Intuitive navigation and organization
- **Accessibility**: Proper contrast and keyboard navigation

## 🔒 System Constraints & Business Rules

### Data Integrity Constraints
1. **Unique Student ID**: Prevents duplicate student records
2. **Unique Email**: Ensures communication integrity
3. **Unique Subject Code**: Maintains academic standards
4. **Unique Section per Subject**: Prevents scheduling conflicts
5. **No Duplicate Enrollments**: Students can't enroll twice in same subject

### Capacity Management
1. **Section Limits**: Hard enforcement of maximum capacity
2. **Real-time Tracking**: Live capacity updates
3. **Auto-assignment**: Smart section selection based on availability
4. **Overflow Prevention**: Clear error messages when sections are full

### Validation Rules
1. **Required Fields**: Mandatory data for all entities
2. **Data Types**: Proper validation of numeric, email, and choice fields
3. **Relationship Integrity**: Foreign key constraints maintained
4. **Business Logic**: Enrollment rules enforced at model and API levels

### Performance Optimizations
1. **Database Indexing**: Optimized queries for large datasets
2. **Select Related**: Efficient loading of related data
3. **Pagination**: Scalable data retrieval
4. **Caching**: Reduced database queries for frequently accessed data

## 🧪 Testing & Validation

### Sample Data
The system includes a management command to populate sample data:

```bash
python manage.py populate_sample_data
```

This creates:
- 10 sample students
- 6 academic subjects
- 12 class sections with varying capacities
- Sample enrollments demonstrating system features

### Manual Testing Scenarios

1. **Capacity Testing**: Try enrolling students beyond section capacity
2. **Duplicate Prevention**: Attempt to enroll student in same subject twice
3. **Section Assignment**: Verify automatic section selection
4. **Bulk Operations**: Test bulk enrollment with mix of valid/invalid data
5. **Status Changes**: Test enrollment status transitions

## 📊 Database Schema

### User Model
- `email` (EmailField, unique): User email (login identifier)
- `name` (CharField): Full name
- `role` (CharField): `admin` or `student`
- `student` (OneToOneField, nullable): Linked Student record
- `admin_image` (ImageField, nullable): Admin profile image (Cloudinary)
- `is_active` (BooleanField): Account activation status (False until email activated)
- `is_staff` (BooleanField): Django admin access
- `date_joined` (DateTimeField): Account creation timestamp

### Student Model
- `student_id` (CharField, unique): Unique student identifier
- `name` (CharField): Full student name
- `email` (EmailField, unique): Student email
- `course` (CharField): Program of study
- `year_level` (CharField): Academic year level
- `age` (IntegerField, optional): Student age

### Subject Model
- `code` (CharField, unique): Subject code (e.g., "CS101")
- `title` (CharField): Subject title
- `description` (TextField): Detailed description
- `units` (IntegerField): Credit units

### Section Model
- `subject` (ForeignKey): Related subject
- `name` (CharField): Section identifier
- `schedule` (CharField): Class schedule
- `time_start/time_end` (TimeField): Class timing
- `room` (CharField): Room assignment
- `max_capacity` (IntegerField): Maximum students

### Enrollment Model
- `student` (ForeignKey): Enrolled student
- `subject` (ForeignKey): Enrolled subject
- `section` (ForeignKey): Assigned section
- `status` (CharField): Enrollment status
- `enrolled_at/updated_at` (DateTimeField): Timestamps

## 🔧 Development & Deployment

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd enrollment-system

# Backend setup
cd Enrollment_api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

# Frontend setup
cd ../frontend
npm install
```

### Production Deployment
1. **Database**: Switch to PostgreSQL in settings.py
2. **Static Files**: Configure static file serving
3. **Security**: Enable HTTPS and secure headers
4. **Environment Variables**: Use environment-specific settings
5. **Monitoring**: Add logging and error tracking

### Code Quality
- **PEP 8**: Python code style compliance
- **TypeScript**: Type safety in frontend
- **ESLint**: JavaScript/React code quality
- **Prettier**: Consistent code formatting

## 📈 System Performance & Scalability

### Optimization Features
- **Database Indexing**: Optimized for common query patterns
- **Query Optimization**: Select related and prefetch for efficiency
- **Pagination**: Handle large datasets gracefully
- **Caching Strategy**: Reduce database load for static data

### Monitoring Points
- **API Response Times**: Track endpoint performance
- **Database Queries**: Monitor query efficiency
- **Error Rates**: Track system reliability
- **User Activity**: Monitor usage patterns

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

### Code Standards
- Follow Django and React best practices
- Write comprehensive tests
- Document API changes
- Maintain code quality standards

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues
1. **Port Conflicts**: Change default ports in settings
2. **Database Errors**: Run migrations after model changes
3. **CORS Issues**: Configure allowed origins in settings
4. **Build Errors**: Clear node_modules and reinstall

### Getting Help
- Check the API documentation
- Review error messages in browser/network tabs
- Examine Django logs for backend issues
- Check React console for frontend errors

---

**Built with Django REST Framework & React** | **Educational Management System** | **Automated Section Assignment**
