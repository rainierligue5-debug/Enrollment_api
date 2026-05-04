import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Loader, User, X } from "lucide-react";
import { login, getStoredUser } from "../api";
import { User as UserType } from "../type";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      const newUser = response.user;
      console.log('Login handleLogin - newUser full:', newUser);
      console.log('Login handleLogin - newUser.role:', newUser.role);
      console.log('Login handleLogin - newUser.role === admin:', newUser.role === 'admin');
      setCurrentUser(newUser);
      onLoginSuccess(newUser);
      // App.tsx routing will handle the redirect
      navigate('/'); 

    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Create Account
                </Link>
              </p>
            </div>

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
            © 2024 USTP Enrollment System
          </p>
        </div>
      </div>
      {currentUser && (
        <div className="mt-6 max-w-md mx-auto">
          <button
onClick={() => setShowProfileModal(true)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            View My Profile
          </button>
        </div>
      )}
      {showProfileModal && currentUser && (
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
                <p className="text-lg font-semibold text-gray-900">{currentUser.email}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">{currentUser.name}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Student'}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Password</p>
                <p className="text-lg font-semibold text-gray-900">••••••••</p>
                <p className="text-xs text-gray-500 mt-1">Contact administrator to change password</p>
              </div>

              {currentUser.student_info && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">Linked Student Account</p>
                  <p className="text-gray-900"><span className="font-medium">Student ID:</span> {currentUser.student_info.student_id}</p>
                  <p className="text-gray-900"><span className="font-medium">Name:</span> {currentUser.student_info.name}</p>
                  <p className="text-gray-900"><span className="font-medium">Course:</span> {currentUser.student_info.course}</p>
                  <p className="text-gray-900"><span className="font-medium">Year:</span> {currentUser.student_info.year_level}</p>
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
    </>
  );
};

export default Login;

