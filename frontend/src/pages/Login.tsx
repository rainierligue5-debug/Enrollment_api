import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Loader } from "lucide-react";
import { login, getStoredUser } from "../api";
import { User } from "../type";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = getStoredUser();
      if (user) {
        navigate(user.role === "admin" ? "/admin" : "/student");
      }
    } catch (err: any) {
      if (err.request) {
        setError("Cannot connect to backend server. Make sure Django is running on http://127.0.0.1:8000");
      } else if (err.response) {
        setError(err.response.data?.error || err.response.data?.detail || "Login failed. Please try again.");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">USTP</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Enrollment System</h1>
          <p className="text-slate-400 mt-2">Sign in to continue</p>
        </div>

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

          <div className="mt-4 text-center">
            <Link to="/password-reset" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
              Forgot your password?
            </Link>
          </div>

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

        <div className="text-center mt-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            Don't have an account? <span className="text-blue-400 font-medium hover:underline">Register here</span>
          </Link>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          &copy; 2024 USTP Enrollment System
        </p>
      </div>
    </div>
  );
};

export default Login;
