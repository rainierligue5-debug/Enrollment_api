// src/pages/Students.tsx
import React, { useEffect, useState, useRef } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Eye, FileText } from "lucide-react";
import { Student, NewStudent } from "../type";
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentEnrollmentSummary, getSubjects } from "../api";

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showProspectus, setShowProspectus] = useState(false);
  const [prospectusData, setProspectusData] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<NewStudent>({
    student_id: "",
    name: "",
    email: "",
    course: "",
    year_level: "1st",
    age: 18,
  });

  const [detailsData, setDetailsData] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError("Failed to fetch students");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.email || !formData.course) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        const updated = await updateStudent(editingId, formData);
        setStudents(students.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createStudent(formData);
        setStudents([...students, created]);
      }
      resetForm();
    } catch (err) {
      setError("Failed to save student");
      console.error(err);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      course: student.course,
      year_level: student.year_level,
      age: student.age,
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        setStudents(students.filter((s) => s.id !== id));
      } catch (err) {
        setError("Failed to delete student");
        console.error(err);
      }
    }
  };

  const handleViewDetails = async (student: Student) => {
    try {
      const details = await getStudentEnrollmentSummary(student.id);
      setDetailsData(details);
      setSelectedStudent(student);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch student details");
    }
  };

  const handleViewProspectus = async (student: Student) => {
    try {
      const subjects = await getSubjects({
        course: student.course,
        year_level: student.year_level,
      });
      setProspectusData(subjects || []);
      setSelectedStudent(student);
      setShowProspectus(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch prospectus");
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      name: "",
      email: "",
      course: "",
      year_level: "1st",
      age: 18,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Focus search with `/` (unless typing in a form control)
      if (e.key === "/") {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Clear search with Escape
      if (e.key === "Escape") {
        if (searchRef.current && document.activeElement === searchRef.current) {
          (searchRef.current as HTMLInputElement).value = "";
          setSearchTerm("");
          (searchRef.current as HTMLInputElement).blur();
        } else {
          setSearchTerm("");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Students</h2>
          <p className="text-slate-600 mt-1">Manage student records and enrollments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {editingId ? "Edit Student" : "New Student"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Student ID (STU001)"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.year_level}
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="16"
                max="50"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600 text-lg">No students yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-4">
            <input
              ref={searchRef}
              type="search"
              placeholder="Search students by name, ID, or email (press / to focus)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Course</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Year Level</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Units</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 && students.length > 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                      No students match your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{student.student_id}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-slate-600">{student.course}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {student.year_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-900">{student.total_units}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleViewProspectus(student)}
                          className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
                          title="View Prospectus"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetails && selectedStudent && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedStudent.name} - Enrollment Summary</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 uppercase font-semibold">Total Subjects</p>
                  <p className="text-2xl font-bold text-blue-600">{detailsData.total_subjects}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 uppercase font-semibold">Total Units</p>
                  <p className="text-2xl font-bold text-green-600">{detailsData.total_units}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Enrolled Subjects</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailsData.enrollments.map((enroll: any) => (
                    <div
                      key={enroll.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="font-semibold text-slate-900">
                        {typeof enroll.subject === "object" ? enroll.subject.code : "N/A"} -{" "}
                        {typeof enroll.subject === "object" ? enroll.subject.title : ""}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-slate-600">
                          Section{" "}
                          {typeof enroll.section === "object"
                            ? enroll.section.name
                            : "N/A"}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            enroll.status === "enrolled"
                              ? "bg-green-100 text-green-700"
                              : enroll.status === "dropped"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {enroll.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Prospectus Modal */}
      {showProspectus && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedStudent.name} - Prospectus</h3>
              <button
                onClick={() => setShowProspectus(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Available Subjects</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {prospectusData.length === 0 ? (
                    <p className="text-slate-600">No subjects available.</p>
                  ) : (
                    prospectusData.map((sub: any) => (
                      <div key={sub.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-900">{sub.code} - {sub.title}</p>
                            <p className="text-sm text-slate-600 mt-1">{sub.description}</p>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">{sub.units}u</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProspectus(false)}
                className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
