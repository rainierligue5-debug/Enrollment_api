// src/type.ts

// STUDENTS
export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  course: string;
  year_level: string;
  age?: number;
  total_units: number;
  total_subjects: number;
  enrollments?: Enrollment[];
  created_at: string;
  updated_at: string;
}

export interface NewStudent {
  student_id: string;
  name: string;
  email: string;
  course: string;
  year_level: string;
  age?: number;
}

// SUBJECTS
export interface Subject {
  id: number;
  code: string;
  title: string;
  description: string;
  units: number;
  created_at: string;
}

export interface NewSubject {
  code: string;
  title: string;
  description: string;
  units: number;
}

// SECTIONS
export interface Section {
  id: number;
  subject: Subject | number;
  name: string;
  schedule: string;
  time_start: string;
  time_end: string;
  room: string;
  max_capacity: number;
  current_enrollment: number;
  available_capacity: number;
  created_at: string;
}

export interface NewSection {
  subject_id: number;
  name: string;
  schedule: string;
  time_start: string;
  time_end: string;
  room: string;
  max_capacity: number;
}

// ENROLLMENTS
export interface Enrollment {
  id: number;
  student: Student | { id: number; name: string };
  student_id: string;
  student_name: string;
  subject: Subject | number;
  section: Section | number;
  status: 'enrolled' | 'dropped' | 'completed';
  enrolled_at: string;
  updated_at: string;
}

export interface NewEnrollment {
  student_id?: number;
  student?: number;
  subject_id?: number;
  subject?: number;
  section_id?: number;
  section?: number;
  status?: string;
}

// USER TYPES
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'student';
  student?: number | null;
  student_id?: string | null;
  student_info?: {
    student_id: string;
    name: string;
    email: string;
    course: string;
    year_level: string;
    age?: number;
  } | null;
  is_active: boolean;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface MyEnrollmentsResponse {
  student: Student;
  enrollments: Enrollment[];
  total_units: number;
  total_subjects: number;
}