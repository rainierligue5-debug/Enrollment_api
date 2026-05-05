// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { User, Mail, Camera, Save, Loader, AlertCircle, CheckCircle, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateCurrentUser } from "../api";
import { User as UserType } from "../type";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
      });
      if (userData.profile_picture) {
        setPreviewUrl(`http://127.0.0.1:8000${userData.profile_picture}`);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setUpdating(true);

    try {
      const updateData: any = {};
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (profilePicture) updateData.profile_picture = profilePicture;

      const updatedUser = await updateCurrentUser(updateData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setProfilePicture(null);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.values(errorData).flat();
        setMessage({ type: 'error', text: errorMessages.join(', ') });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Click the camera icon to update your profile picture</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                )}
                <p className={`${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updating ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Profile
                  </>
                )}
              </button>
            </form>

            {/* User Info Display */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.date_joined).toLocaleDateString()}</p>
                </div>
                {user.student_info && (
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{user.student_info.student_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;