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
  RegistrationData,
  AdminRegistrationData,
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
<<<<<<< HEAD
  const res = await API.post<AuthResponse>("auth/jwt/create/", { email, password });
  if (res.data.access) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    // Get user info after login
    const userRes = await API.get<User>("auth/users/me/");
    localStorage.setItem("user", JSON.stringify(userRes.data));
    return { ...res.data, user: userRes.data };
  }
  return res.data;
};

export const register = async (data: {
  email: string;
  name: string;
  password: string;
  re_password: string;
  profile_picture?: File;
}): Promise<any> => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('name', data.name);
  formData.append('password', data.password);
  formData.append('re_password', data.re_password);
  formData.append('role', 'student');
  if (data.profile_picture) {
    formData.append('profile_picture', data.profile_picture);
  }

  const res = await API.post("auth/users/", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const activateAccount = async (uid: string, token: string): Promise<any> => {
  const res = await API.post("auth/users/activation/", { uid, token });
  return res.data;
};

export const refreshToken = async (): Promise<any> => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");

  const res = await API.post("auth/jwt/refresh/", { refresh });
  if (res.data.access) {
    localStorage.setItem("access_token", res.data.access);
=======
  const res = await API.post<AuthResponse>("auth/login/", { email, password });
  if (res.data.access) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("user", JSON.stringify(res.data.user));
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
  }
  return res.data;
};

export const logout = async (): Promise<void> => {
<<<<<<< HEAD
  // For JWT, we just remove tokens from localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = '/';
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await API.get<User>("auth/users/me/");
=======
  await API.post("auth/logout/");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await API.get<User>("auth/me/");
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
  return res.data;
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

<<<<<<< HEAD
export const updateCurrentUser = async (data: { name?: string; email?: string; password?: string; profile_picture?: File }): Promise<User> => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.email) formData.append('email', data.email);
  if (data.password) formData.append('password', data.password);
  if (data.profile_picture) formData.append('profile_picture', data.profile_picture);

  const res = await API.patch<User>("auth/users/me/", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
=======
export const updateCurrentUser = async (data: { name?: string; email?: string; password?: string }): Promise<User> => {
  const res = await API.patch<User>("auth/me/", data);
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
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

// ============== REGISTRATION & ACTIVATION ==============

export const registerStudent = async (data: RegistrationData): Promise<{ message: string; user: { email: string; name: string } }> => {
  const res = await API.post("auth/register/", data);
  return res.data;
};

export const registerAdmin = async (data: AdminRegistrationData): Promise<{ message: string; user: { email: string; name: string } }> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('re_password', data.re_password);
  if (data.admin_image) {
    formData.append('admin_image', data.admin_image);
  }
  const res = await API.post("auth/register-admin/", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const activateAccount = async (uid: string, token: string): Promise<{ message: string }> => {
  const res = await API.post("auth/users/activation/", { uid, token });
  return res.data;
};

export const resendActivation = async (email: string): Promise<{ message: string }> => {
  const res = await API.post("auth/users/resend_activation/", { email });
  return res.data;
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const res = await API.post("auth/users/reset_password/", { email });
  return res.data;
};

export const confirmPasswordReset = async (uid: string, token: string, new_password: string, re_new_password: string): Promise<void> => {
  await API.post("auth/users/reset_password_confirm/", { uid, token, new_password, re_new_password });
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