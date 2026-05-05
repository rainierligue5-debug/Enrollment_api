import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as apiLogout, getStoredUser } from "../api";
import { User } from "../type";
import { X, Eye, ChevronRight, ChevronLeft, BookOpen, UserCircle } from "lucide-react";
import StudentDashboard from "../pages/StudentDashboard";

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const lastTab = localStorage.getItem("lastTab_student");
    return lastTab || "my_enrollments";
  });

  const handleLogout = () => {
    apiLogout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastTab_admin");
    localStorage.removeItem("lastTab_student");
    navigate("/login");
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem("lastTab_student", tabId);
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-center h-12 bg-blue-600 rounded-lg">
            <span className="text-2xl font-bold">USTP</span>
          </div>
          {sidebarOpen && (
            <div className="mt-2">
              <p className="text-center text-sm font-semibold">Enrollment</p>
              <p className="text-center text-xs text-blue-400 mt-1">Student</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleTabChange("my_enrollments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "my_enrollments"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">My Enrollments</span>}
          </button>
          <button
            onClick={() => handleTabChange("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <UserCircle className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">My Profile</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === "profile" ? "My Profile" : "My Enrollments"}
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleTabChange("profile"); }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="p-8">
          {activeTab === "profile" ? <ProfileSection user={user} /> : <StudentDashboard />}
        </section>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProfileContent user={user} />
            <div className="mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
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

const ProfileContent: React.FC<{ user: User }> = ({ user }) => (
  <div className="space-y-4">
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">Email</p>
      <p className="text-lg font-semibold text-gray-900">{user.email}</p>
    </div>
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">Name</p>
      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
    </div>
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">Role</p>
      <p className="text-lg font-semibold text-gray-900">Student</p>
    </div>
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">Password</p>
      <p className="text-lg font-semibold text-gray-900">••••••••</p>
      <p className="text-xs text-gray-500 mt-1">Contact administrator to change password</p>
    </div>
    {user.student_info && (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-600 font-medium mb-2">Linked Student Account</p>
        <p className="text-gray-900"><span className="font-medium">Student ID:</span> {user.student_info.student_id}</p>
        <p className="text-gray-900"><span className="font-medium">Name:</span> {user.student_info.name}</p>
        <p className="text-gray-900"><span className="font-medium">Course:</span> {user.student_info.course}</p>
        <p className="text-gray-900"><span className="font-medium">Year:</span> {user.student_info.year_level}</p>
      </div>
    )}
  </div>
);

const ProfileSection: React.FC<{ user: User }> = ({ user }) => (
  <div className="max-w-2xl">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
    <ProfileContent user={user} />
  </div>
);

export default StudentLayout;
