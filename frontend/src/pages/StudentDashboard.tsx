// src/pages/StudentDashboard.tsx
import React, { useState, useEffect } from "react";
import { BookOpen, Users, Grid3x3, Clock, MapPin, AlertCircle, Loader, GraduationCap } from "lucide-react";
import { getMyEnrollments } from "../api";
import { MyEnrollmentsResponse } from "../type";

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<MyEnrollmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const result = await getMyEnrollments();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load enrollments");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <AlertCircle className="text-red-600 mr-3" />
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8 bg-yellow-50 rounded-lg border-2 border-yellow-200">
        <AlertCircle className="text-yellow-600 mr-3" />
        <p className="text-yellow-700 font-semibold">No enrollment data found</p>
      </div>
    );
  }

  const { student, enrollments, total_units, total_subjects } = data;

  return (
    <div className="space-y-8">
      {/* Student Info Header */}
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
  );
};

export default StudentDashboard;