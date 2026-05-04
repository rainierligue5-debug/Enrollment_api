// src/pages/StudentUsers.tsx
import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Eye, AlertCircle, Loader, X, RefreshCw } from "lucide-react";
import { getStudentUsers, createStudentUser, updateStudentUser, deleteStudentUser, getStudents, resetStudentPassword } from "../api";
import { User, Student } from "../type";

const StudentUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    student_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, studentsData] = await Promise.all([
        getStudentUsers(),
        getStudents(),
      ]);
      setUsers(usersData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ email: "", name: "", password: "", student_id: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      student_id: user.student_id || "",
    });
    setShowModal(true);
  };

  const handleOpenView = (user: User) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingUser) {
        await updateStudentUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          student_id: formData.student_id || null,
        });
        setSuccessMessage("Student user updated successfully");
      } else {
        await createStudentUser({
          email: formData.email,
          name: formData.name,
          password: formData.password || "student123",
          student_id: formData.student_id || undefined,
        });
        setSuccessMessage("Student user created successfully");
      }
      
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save user");
    }
  };

  const handleDelete = async (userId: number) => {
    setDeletingUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingUserId) return;
    
    try {
      await deleteStudentUser(deletingUserId);
      setSuccessMessage("User deleted successfully");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete user");
    } finally {
      setShowDeleteModal(false);
      setDeletingUserId(null);
    }
  };

  const handleResetPassword = async (userId: number) => {
    setResettingUserId(userId);
    setResetPassword(null);
    setShowResetModal(true);
    
    try {
      const result = await resetStudentPassword(userId);
      setResetPassword(result.new_password);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
      setShowResetModal(false);
    }
  };

  const getLinkedStudent = (studentId: number | null) => {
    if (!studentId) return null;
    return students.find(s => s.id === studentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Student Login Accounts</h1>
            <p className="text-gray-500 mt-2">Manage student login credentials</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition font-medium"
          >
            <Plus className="w-5 h-5" /> Create Student User
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Users ({users.length})
            </h3>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No student users yet</p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create First Student User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Linked Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const linkedStudent = getLinkedStudent(user.student as number | null);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                        <td className="px-6 py-4 text-sm">
                          {linkedStudent ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {linkedStudent.student_id} - {linkedStudent.name}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">Not linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenView(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View credentials"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Reset password"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit Student User' : 'Create Student User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingUser && <span className="text-gray-500">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingUser ? "••••••••" : "Default: student123"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link to Student (Optional)</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not linked</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.student_id}>
                      {s.student_id} - {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login Credentials</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{viewingUser.email}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">{viewingUser.name}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Password</p>
                <p className="text-lg font-semibold text-gray-900">••••••••</p>
                <p className="text-xs text-gray-500 mt-1">Contact admin to change password</p>
              </div>

              {viewingUser.student_info && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">Linked Student Account</p>
                  <p className="text-gray-900"><span className="font-medium">Student ID:</span> {viewingUser.student_info.student_id}</p>
                  <p className="text-gray-900"><span className="font-medium">Name:</span> {viewingUser.student_info.name}</p>
                  <p className="text-gray-900"><span className="font-medium">Course:</span> {viewingUser.student_info.course}</p>
                  <p className="text-gray-900"><span className="font-medium">Year:</span> {viewingUser.student_info.year_level}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Password Reset</h2>
              <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {resetPassword ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-medium">Password has been reset successfully!</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">New Password</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{resetPassword}</p>
                </div>
                <p className="text-sm text-gray-500">Please copy this password and share it with the student.</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPassword);
                    setSuccessMessage("Password copied to clipboard!");
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Copy to Clipboard
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
            
            <button
              onClick={() => setShowResetModal(false)}
              className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentUsers;