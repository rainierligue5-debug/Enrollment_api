// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Users, BookOpen, Grid3x3, TrendingUp, AlertCircle } from "lucide-react";
import { getStudents, getSubjects, getSections, getEnrollments } from "../api";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalSections: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

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
      trend: "12 total",
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

    </div>
  );
};

export default Dashboard;
