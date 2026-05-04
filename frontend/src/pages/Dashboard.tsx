// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Users, BookOpen, Grid3x3, TrendingUp, AlertCircle, LogOut, User, UserCircle, Camera, RefreshCw, UserPlus, BookPlus, LayoutGrid, Users2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudents, getSubjects, getSections, getEnrollments, logout, getCurrentUser, getStoredUser } from "../api";
import { User as UserType } from "../type";
=======
import { Users, BookOpen, Grid3x3, TrendingUp, AlertCircle } from "lucide-react";
import { getStudents, getSubjects, getSections, getEnrollments } from "../api";
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

const Dashboard: React.FC = () => {
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalSections: 0,
    totalEnrollments: 0,
  });
<<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    fetchUser();
    fetchStats();
  }, []);  


  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
=======
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
      const [students, subjects, sections, enrollments] = await Promise.all([
        getStudents(),
        getSubjects(),
        getSections(),
        getEnrollments(),
      ]);

      setStats({
        totalStudents: students.length || 0,
        totalSubjects: subjects.length || 0,
        totalSections: sections.length || 0,
        totalEnrollments: enrollments.length || 0,
      });
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
<<<<<<< HEAD
      setStatsLoading(false);
    }
  };

  const handleRefreshStats = () => {
    fetchStats();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

=======
      setLoading(false);
    }
  };

>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
  const statCards: StatCard[] = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: <Users size={24} />,
      trend: "+12% this month",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Subjects",
      value: stats.totalSubjects,
      icon: <BookOpen size={24} />,
      trend: "+2 new courses",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Sections",
      value: stats.totalSections,
      icon: <Grid3x3 size={24} />,
<<<<<<< HEAD
      trend: `${stats.totalSections} total`,
=======
      trend: "12 total",
>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
      color: "from-green-500 to-green-600",
    },
    {
      label: "Enrollments",
      value: stats.totalEnrollments,
      icon: <TrendingUp size={24} />,
      trend: "+8% increase",
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <AlertCircle className="text-red-600 mr-3" />
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">React Admin Dashboard</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Optional</span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                {currentUser.profile_picture ? (
                  <img 
                    src={`http://127.0.0.1:8000${currentUser.profile_picture}`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={18} />
              <span>{currentUser ? currentUser.name : 'Profile'}</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <a 
                href="/admin/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-center block"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.426 1.756 2.924 1.756 3.35 0z" />
                </svg>
                Django Admin Panel (Recommended)
              </a>

              <button
                onClick={() => navigate('/enrollments')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
              >
                <GraduationCap size={20} />
                Enroll Students
              </button>

              <button
                onClick={() => navigate('/students')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
              >
                <Users2 size={20} />
                Manage Students
              </button>
              <button
                onClick={() => navigate('/subjects')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
              >
                <BookPlus size={20} />
                Add Subjects
              </button>
              <button
                onClick={() => navigate('/sections')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
              >
                <LayoutGrid size={20} />
                Add Sections
              </button>
              <button
                onClick={() => navigate('/student-users')}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
              >
                <UserPlus size={20} />
                Student Accounts
              </button>
            </div>
          </div>
          
          {/* Refresh Stats */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <button
              onClick={handleRefreshStats}
              disabled={statsLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={statsLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"} />
              {statsLoading ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>
        </div>

        {/* Main Stats Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, Admin!</h2>
                <p className="text-slate-300 text-lg">
                  Complete control over enrollment system
                </p>
              </div>
              {currentUser && (
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Logged in as</p>
                  <p className="font-semibold">{currentUser.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">System Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {statCards.map((card, index) => (
                <div key={index} className="bg-gradient-to-br relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl hover:scale-[1.02] transition-all group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="opacity-20">{card.icon}</div>
                    </div>
                    <p className="text-lg font-medium opacity-90 mb-2">{card.label}</p>
                    <p className="text-5xl font-bold">{card.value}</p>
                    <p className="flex items-center gap-2 mt-3 opacity-90">
                      <TrendingUp size={18} className="text-green-200" />
                      {card.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
=======
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome to Enrollment System</h2>
        <p className="text-slate-300 text-lg">
          Manage students, subjects, sections, and enrollments efficiently
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className={`bg-gradient-to-br ${card.color} text-white p-6 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{card.label}</p>
                  <p className="text-4xl font-bold mt-2">{card.value}</p>
                </div>
                <div className="opacity-20">{card.icon}</div>
              </div>
            </div>
            <div className="p-4 text-sm text-slate-600 border-t border-gray-100">
              <p className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                {card.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

>>>>>>> d3f2e15e7c192706ccca1f1e91e5c76934a284ed
    </div>
  );
};

export default Dashboard;
