import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle, Loader, UserCheck, GraduationCap, Hash, Shield, Upload, Image as ImageIcon, X } from "lucide-react";
import { registerStudent, registerAdmin } from "../api";
import { RegistrationData, AdminRegistrationData } from "../type";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [studentData, setStudentData] = useState<RegistrationData>({
    student_id: "",
    name: "",
    email: "",
    course: "",
    year_level: "",
    age: null,
    password: "",
    re_password: "",
  });
  const [adminData, setAdminData] = useState<AdminRegistrationData>({
    name: "",
    email: "",
    password: "",
    re_password: "",
    admin_image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: name === "age" && value === "" ? null : (name === "age" ? parseInt(value) || null : value),
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdminData(prev => ({ ...prev, admin_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAdminData(prev => ({ ...prev, admin_image: null }));
    setImagePreview(null);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await registerStudent(studentData);
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const errors: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            errors[key] = value.join(", ");
          } else if (typeof value === "string") {
            errors[key] = value;
          }
        });
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        } else {
          setError(data.detail || data.error || "Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await registerAdmin(adminData);
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const errors: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            errors[key] = value.join(", ");
          } else if (typeof value === "string") {
            errors[key] = value;
          }
        });
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        } else {
          setError(data.detail || data.error || "Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = role === "student" ? handleStudentSubmit : handleAdminSubmit;
  const email = role === "student" ? studentData.email : adminData.email;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Please check your email (<span className="font-semibold text-gray-900">{email}</span>) for an activation link. 
              Click the link to activate your account and log in.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong> If SMTP is not configured, the activation link may be printed in the Django console output.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-3 ${role === "admin" ? "bg-purple-600" : "bg-blue-600"}`}>
            {role === "admin" ? <Shield className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white">
            {role === "admin" ? "Admin Registration" : "Student Registration"}
          </h1>
          <p className="text-slate-400 mt-1">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${
                role === "student"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${
                role === "admin"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {role === "student" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="student_id"
                      value={studentData.student_id}
                      onChange={handleStudentChange}
                      placeholder="e.g., 2024001"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.student_id ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.student_id && <p className="text-red-600 text-xs mt-1">{fieldErrors.student_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={studentData.name}
                      onChange={handleStudentChange}
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={studentData.email}
                      onChange={handleStudentChange}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <input
                      type="text"
                      name="course"
                      value={studentData.course}
                      onChange={handleStudentChange}
                      placeholder="Computer Science"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.course ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                    {fieldErrors.course && <p className="text-red-600 text-xs mt-1">{fieldErrors.course}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                    <select
                      name="year_level"
                      value={studentData.year_level}
                      onChange={handleStudentChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.year_level ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                    {fieldErrors.year_level && <p className="text-red-600 text-xs mt-1">{fieldErrors.year_level}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (Optional)</label>
                  <input
                    type="number"
                    name="age"
                    value={studentData.age ?? ""}
                    onChange={handleStudentChange}
                    placeholder="18"
                    min="15"
                    max="100"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={adminData.name}
                      onChange={handleAdminChange}
                      placeholder="Jane Smith"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        fieldErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleAdminChange}
                      placeholder="admin@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        fieldErrors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Optional)</label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={role === "student" ? studentData.password : adminData.password}
                    onChange={role === "student" ? handleStudentChange : handleAdminChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                      role === "student" ? "focus:ring-blue-500" : "focus:ring-purple-500"
                    } transition ${
                      fieldErrors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="re_password"
                    value={role === "student" ? studentData.re_password : adminData.re_password}
                    onChange={role === "student" ? handleStudentChange : handleAdminChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                      role === "student" ? "focus:ring-blue-500" : "focus:ring-purple-500"
                    } transition ${
                      fieldErrors.re_password ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {fieldErrors.re_password && <p className="text-red-600 text-xs mt-1">{fieldErrors.re_password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === "admin"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  Create {role === "admin" ? "Admin" : "Student"} Account
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-blue-400 font-medium hover:underline">Back to Login</span>
          </Link>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          &copy; 2024 USTP Enrollment System
        </p>
      </div>
    </div>
  );
};

export default Register;
