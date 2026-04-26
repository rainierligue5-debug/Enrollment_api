// src/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { Mail, Lock, LogIn, AlertCircle, Loader, X, Eye } from "lucide-react";
import { login, logout as apiLogout, getStoredUser } from "../api";
import { User } from "../type";
import Dashboard from "./Dashboard";
import Students from "./Students";
import Subjects from "./Subjects";
import Sections from "./Sections";
import Enrollments from "./Enrollment";
import StudentDashboard from "./StudentDashboard";
import StudentUsers from "./StudentUsers";

type TabType = "dashboard" | "students" | "subjects" | "sections" | "enrollments" | "student_users" | "my_enrollments" | "profile";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getDefaultTab = (role: string): TabType => {
    return role === "admin" ? "dashboard" : "my_enrollments";
  };

  useEffect(() => {
    if (user) {
      const storedKey = `lastTab_${user.role}`;
      const lastTab = localStorage.getItem(storedKey);
      if (lastTab) {
        setActiveTab(lastTab as TabType);
      } else {
        const defaultTab = getDefaultTab(user.role);
        setActiveTab(defaultTab);
      }
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      const newUser = response.user;
      setUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      const defaultTab = getDefaultTab(newUser.role);
      setActiveTab(defaultTab);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastTab_admin");
    localStorage.removeItem("lastTab_student");
    setIsLoggedIn(false);
    setUser(null);
    setEmail("");
    setPassword("");
    setActiveTab("dashboard");
    setShowProfileDropdown(false);
    setShowProfileModal(false);
  };

  const handleAvatarClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  if (isLoggedIn && user) {
    const isAdmin = user.role === "admin";

    const adminNavigationItems = [
      { id: "dashboard", label: "Dashboard", icon: "Home" },
      { id: "students", label: "Students", icon: "Users" },
      { id: "subjects", label: "Subjects", icon: "BookOpen" },
      { id: "sections", label: "Sections", icon: "Grid3x3" },
      { id: "enrollments", label: "Enrollments", icon: "Clipboard" },
      { id: "student_users", label: "Student Accounts", icon: "Key" },
    ];

    const studentNavigationItems = [
      { id: "my_enrollments", label: "My Enrollments", icon: "BookOpen" },
    ];

    const navigationItems = isAdmin ? adminNavigationItems : studentNavigationItems;

    const renderIcon = (iconName: string) => {
      switch (iconName) {
        case "Home": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
        case "Users": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case "BookOpen": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
        case "Grid3x3": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        case "Clipboard": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
        case "Key": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
        default: return null;
      }
    };

    const handleTabChange = (tabId: TabType) => {
      setActiveTab(tabId);
      const storageKey = `lastTab_${user.role}`;
      localStorage.setItem(storageKey, tabId);
    };

    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-all duration-300 flex flex-col`}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-center h-12 bg-blue-600 rounded-lg">
              <span className="text-2xl font-bold">USTP</span>
            </div>
            {sidebarOpen && (
              <div className="mt-2">
                <p className="text-center text-sm font-semibold">Enrollment</p>
                <p className="text-center text-xs text-blue-400 mt-1">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {renderIcon(item.icon)}
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-slate-900">
                {navigationItems.find((item) => item.id === activeTab)?.label}
              </h1>
              <div className="relative">
                <button
                  onClick={handleAvatarClick}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleViewProfile}
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
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "students" && <Students />}
            {activeTab === "subjects" && <Subjects />}
            {activeTab === "sections" && <Sections />}
            {activeTab === "enrollments" && <Enrollments />}
            {activeTab === "student_users" && <StudentUsers />}
            {activeTab === "my_enrollments" && <StudentDashboard />}
          </section>
        </main>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                  <p className="text-lg font-semibold text-gray-900">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">USTP</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Enrollment System</h1>
          <p className="text-slate-400 mt-2">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.edu"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-gray-700">Admin</p>
                <p className="text-gray-500">admin@admin.edu</p>
                <p className="text-gray-500">admin123</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-gray-700">Student</p>
                <p className="text-gray-500">student@ustp.edu</p>
                <p className="text-gray-500">student123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          &copy; 2024 USTP Enrollment System
        </p>
      </div>
    </div>
  );
};

export default Login;