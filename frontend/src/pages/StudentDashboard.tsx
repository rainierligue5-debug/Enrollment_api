// src/pages/StudentDashboard.tsx
import React, { useState, useEffect } from "react";
import { BookOpen, Users, Grid3x3, Clock, MapPin, AlertCircle, Loader, GraduationCap, LogOut, UserCircle, BarChart3, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyEnrollments, getCurrentUser, getStoredUser, logout } from "../api";
import type { MyEnrollmentsResponse, User as UserType } from "../type";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MyEnrollmentsResponse | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    fetchUser();
    fetchMyEnrollments();
  }, []);

  const fetchUser = async () => {
    try {
      setUserLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
    } catch (err) {
      console.error("Failed to fetch user");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      setEnrollLoading(true);
      const result = await getMyEnrollments();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load enrollments");
      console.error(err);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getScheduleLabel = (schedule: string) => {
    const schedules: { [key: string]: string } = {
      'MWF': 'Mon, Wed, Fri',
      'TTH': 'Tue, Thu',
      'DAILY': 'Daily',
      'SAT': 'Saturday',
    };
    return schedules[schedule] || schedule;
  };

  if (userLoading || enrollLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdminView = user?.role === 'admin';
  
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profile_picture ? (
                    <img src={`http://127.0.0.1:8000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={20} className="text-gray-400" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users size={18} />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Admin Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Admin Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-indigo-600">1,247</p>
                  </div>
                  <Users className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                    <p className="text-3xl font-bold text-green-600">2,456</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/students')}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-xl transition-all hover:bg-blue-50"
                >
                  <Shield className="w-6 h-6 text-blue-600" />
                  Manage Students
                </button>
                <button
                  onClick={() => navigate('/subjects')}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-dashed border-green-200 hover:border-green-300 rounded-xl transition-all hover:bg-green-50"
                >
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Manage Subjects
                </button>
                <button
                  onClick={() => navigate('/sections')}
                  className="w-full flex items-center gap-3 p-4 bg-purple-50 border-2 border-dashed border-purple-200 hover:border-purple-300 rounded-xl transition-all hover:bg-purple-50"
                >
                  <Grid3x3 className="w-6 h-6 text-purple-600" />
                  Manage Sections
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student view
  const { 
    student, 
    enrollments = [], 
    total_units = 0, 
    total_subjects = 0 
  } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profile_picture ? (
                  <img src={`http://127.0.0.1:8000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users size={18} />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Student Info Header */}
          {!student ? (
            <div className="bg-gradient-to-r from-orange-900 to-orange-800 text-white rounded-2xl p-8 shadow-lg border-2 border-dashed border-orange-500/50">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                <h2 className="text-2xl font-bold mb-2">Student Profile Not Linked</h2>
                <p className="text-orange-200 mb-4">Your login account needs to be linked to a student record.</p>
                <p className="text-orange-100 text-sm">Contact administrator or check <a href="/students" className="underline hover:no-underline">Student Management</a></p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-blue-300">{student.student_id} • {student.course}</p>
                  <p className="text-slate-400 text-sm">{student.year_level} Year</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Enrolled Subjects</p>
                    <p className="text-4xl font-bold mt-2">{total_subjects}</p>
                  </div>
                  <BookOpen className="w-12 h-12 opacity-20" />
                </div>
              </div>
              <div className="p-4 text-sm text-slate-600 border-t border-gray-100">
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Active enrollments
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Total Units</p>
                    <p className="text-4xl font-bold mt-2">{total_units}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-20" />
                </div>
              </div>
              <div className="p-4 text-sm text-slate-600 border-t border-gray-100">
                <p className="flex items-center gap-2">
                  Credit hours enrolled
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Sections</p>
                    <p className="text-4xl font-bold mt-2">{enrollments.length}</p>
                  </div>
                  <Grid3x3 className="w-12 h-12 opacity-20" />
                </div>
              </div>
              <div className="p-4 text-sm text-slate-600 border-t border-gray-100">
                <p className="flex items-center gap-2">
                  Class sections
                </p>
              </div>
            </div>
          </div>

          {/* Enrolled Subjects */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h3 className="text-lg font-semibold text-gray-900">Enrolled Subjects</h3>
              <p className="text-sm text-gray-500">Your current course enrollments</p>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No enrollments yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {enrollments.map((enrollment) => {
                  const subject = typeof enrollment.subject === 'object' ? enrollment.subject : null;
                  const section = typeof enrollment.section === 'object' ? enrollment.section : null;

                  return (
                    <div key={enrollment.id} className="p-6 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between">
                        {/* Subject Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {subject?.code || 'N/A'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              enrollment.status === 'enrolled' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {enrollment.status}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">{subject?.title || 'Unknown Subject'}</h4>
                          <p className="text-sm text-gray-500">{subject?.units} units</p>
                        </div>

                        {/* Section Info */}
                        <div className="text-right">
                          <div className="bg-slate-100 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-900">
                              Section {section?.name || 'N/A'}
                            </p>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {section ? `${formatTime(section.time_start)} - ${formatTime(section.time_end)}` : 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Grid3x3 className="w-4 h-4" />
                                {section ? getScheduleLabel(section.schedule) : 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {section?.room || 'TBA'}
                              </div>
                            </div>
                            
                            {/* Capacity */}
                            {section && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Capacity</span>
                                  <span className={`font-medium ${
                                    (section.current_enrollment || 0) >= (section.max_capacity || 0)
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}>
                                    {section.current_enrollment || 0} / {section.max_capacity || 0}
                                  </span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      (section.current_enrollment || 0) >= (section.max_capacity || 0)
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min(
                                        ((section.current_enrollment || 0) / (section.max_capacity || 1)) * 100, 
                                        100 
                                      )}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
