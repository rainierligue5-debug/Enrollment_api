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
} from "./type";

const API: AxiosInstance = axios.create({ baseURL: "http://127.0.0.1:8000/api/" });

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