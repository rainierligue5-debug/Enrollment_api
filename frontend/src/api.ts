// src/api.ts
import axios, { AxiosInstance } from "axios";
import {
  Student,
  NewStudent,
  Subject,
  NewSubject,
  Section,
  NewSection,
  Enrollment,
  NewEnrollment,
  User,
  AuthResponse,
  MyEnrollmentsResponse,
} from "./type";

const API: AxiosInstance = axios.create({ baseURL: "http://127.0.0.1:8000/api/" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ============== AUTH ==============

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await API.post<AuthResponse>("auth/login/", { email, password });
  if (res.data.access) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logout = async (): Promise<void> => {
  await API.post("auth/logout/");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await API.get<User>("auth/me/");
  return res.data;
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const updateCurrentUser = async (data: { name?: string; email?: string; password?: string }): Promise<User> => {
  const res = await API.patch<User>("auth/me/", data);
  return res.data;
};

// ============== STUDENT USERS (Admin) ==============

export const getStudentUsers = async (): Promise<User[]> => {
  const res = await API.get<User[]>("users/students/");
  return res.data;
};

export const createStudentUser = async (data: { 
  email: string; 
  name: string; 
  password?: string; 
  student_id?: string 
}): Promise<User> => {
  const res = await API.post<User>("users/students/", data);
  return res.data;
};

export const updateStudentUser = async (id: number, data: { 
  name?: string; 
  email?: string; 
  password?: string; 
  student_id?: string | null 
}): Promise<User> => {
  const res = await API.patch<User>(`users/students/${id}/`, data);
  return res.data;
};

export const deleteStudentUser = async (id: number): Promise<void> => {
  await API.delete(`users/students/${id}/`);
};

export const resetStudentPassword = async (id: number): Promise<{ new_password: string; user: User }> => {
  const res = await API.post(`users/students/${id}/reset-password`);
  return res.data;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

// ============== STUDENTS ==============

export const getStudents = async (): Promise<Student[]> => {
  const res = await API.get<any>("students/");
  return res.data.results || res.data;
};

export const getStudent = async (id: number): Promise<Student> => {
  const res = await API.get<Student>(`students/${id}/`);
  return res.data;
};

export const getStudentEnrollmentSummary = async (id: number): Promise<any> => {
  const res = await API.get(`students/${id}/enrollment-summary/`);
  return res.data;
};

export const createStudent = async (data: NewStudent): Promise<Student> => {
  const res = await API.post<Student>("students/", data);
  return res.data;
};

export const updateStudent = async (id: number, data: Partial<NewStudent>): Promise<Student> => {
  const res = await API.patch<Student>(`students/${id}/`, data);
  return res.data;
};

export const deleteStudent = async (id: number): Promise<void> => {
  await API.delete(`students/${id}/`);
};

// ============== SUBJECTS ==============

export const getSubjects = async (params?: { course?: string; year_level?: string }): Promise<Subject[]> => {
  let url = "subjects/";
  if (params) {
    const query = new URLSearchParams();
    if (params.course) query.append('course', params.course);
    if (params.year_level) query.append('year_level', params.year_level);
    url += '?' + query.toString();
  }
  const res = await API.get<any>(url);
  return res.data.results || res.data;
};

export const getSubject = async (id: number): Promise<Subject> => {
  const res = await API.get<Subject>(`subjects/${id}/`);
  return res.data;
};

export const createSubject = async (data: NewSubject): Promise<Subject> => {
  const res = await API.post<Subject>("subjects/", data);
  return res.data;
};

export const updateSubject = async (id: number, data: Partial<NewSubject>): Promise<Subject> => {
  const res = await API.patch<Subject>(`subjects/${id}/`, data);
  return res.data;
};

export const deleteSubject = async (id: number): Promise<void> => {
  await API.delete(`subjects/${id}/`);
};

// ============== SECTIONS ==============

export const getSections = async (): Promise<Section[]> => {
  const res = await API.get<any>("sections/");
  return res.data.results || res.data;
};

export const getSection = async (id: number): Promise<Section> => {
  const res = await API.get<Section>(`sections/${id}/`);
  return res.data;
};

export const getSectionEnrolledStudents = async (id: number): Promise<any> => {
  const res = await API.get(`sections/${id}/enrolled-students/`);
  return res.data;
};

export const createSection = async (data: NewSection): Promise<Section> => {
  const res = await API.post<Section>("sections/", data);
  return res.data;
};

export const updateSection = async (id: number, data: Partial<NewSection>): Promise<Section> => {
  const res = await API.patch<Section>(`sections/${id}/`, data);
  return res.data;
};

export const deleteSection = async (id: number): Promise<void> => {
  await API.delete(`sections/${id}/`);
};

// ============== ENROLLMENTS ==============

export const getEnrollments = async (): Promise<Enrollment[]> => {
  const res = await API.get<any>("enrollments/");
  return res.data.results || res.data;
};

export const getEnrollment = async (id: number): Promise<Enrollment> => {
  const res = await API.get<Enrollment>(`enrollments/${id}/`);
  return res.data;
};

export const createEnrollment = async (data: NewEnrollment): Promise<Enrollment> => {
  const res = await API.post<Enrollment>("enrollments/", data);
  return res.data;
};

export const updateEnrollment = async (id: number, data: Partial<NewEnrollment>): Promise<Enrollment> => {
  const res = await API.patch<Enrollment>(`enrollments/${id}/`, data);
  return res.data;
};

export const dropEnrollment = async (id: number): Promise<any> => {
  const res = await API.post(`enrollments/${id}/drop/`);
  return res.data;
};

export const deleteEnrollment = async (id: number): Promise<void> => {
  await API.delete(`enrollments/${id}/`);
};

export const bulkEnroll = async (enrollments: any[]): Promise<any> => {
  const res = await API.post("enrollments/bulk-enroll/", { enrollments });
  return res.data;
};

// ============== STUDENT MY ENROLLMENTS ==============

export const getMyEnrollments = async (): Promise<MyEnrollmentsResponse> => {
  const res = await API.get<MyEnrollmentsResponse>("enrollments/my_enrollments/");
  return res.data;
};