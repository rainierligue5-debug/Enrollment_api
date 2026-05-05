import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Activation from "./pages/Activation";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activation/:uid/:token" element={<Activation />} />
      <Route path="/activate/:uid/:token" element={<Activation />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      } />
      <Route path="/student/*" element={
        <ProtectedRoute requiredRole="student">
          <StudentLayout />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Activation from "./pages/Activation";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import EnrollmentPage from "./pages/Enrollment";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import StudentUsers from "./pages/StudentUsers";
import { getStoredUser } from "./api";
import type { User } from "./type";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    console.log('App useEffect - storedUser:', storedUser);
    console.log('App useEffect - isAdmin:', storedUser?.role === 'admin');
    setUser(storedUser);
  }, []);

  const handleLoginSuccess = (userData: User) => {
    console.log('Login success - userData full object:', userData);
    console.log('Login success - userData.role:', userData.role);
    console.log('Login success - typeof userData.role:', typeof userData.role);
    console.log('Login success - userData.role === \"admin\":', userData.role === 'admin');
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const storedUser = getStoredUser();
  console.log('App render - FULL storedUser:', JSON.stringify(storedUser, null, 2));
  console.log('App render - storedUser.role:', storedUser?.role);
  console.log('App render - typeof storedUser.role:', typeof storedUser?.role);
  console.log('App render - isAdmin:', storedUser?.role === 'admin');
  const isAuthenticated = !!storedUser;
  const isAdmin = (storedUser?.role === 'admin') || (storedUser?.is_staff === true);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin/" : "/student-dashboard"} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } />
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin/" : "/student-dashboard"} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/activate/:uid/:token" element={<Activation />} />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />}
          />
          <Route path="/admin" element={<Navigate to="/admin/" replace />} />
          <Route
            path="/dashboard"
            element={isAuthenticated && isAdmin ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/enrollments"
            element={isAuthenticated && isAdmin ? <EnrollmentPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/students"
            element={isAuthenticated && isAdmin ? <Students /> : <Navigate to="/" replace />}
          />
          <Route
            path="/subjects"
            element={isAuthenticated && isAdmin ? <Subjects /> : <Navigate to="/" replace />}
          />
          <Route
            path="/sections"
            element={isAuthenticated && isAdmin ? <Sections /> : <Navigate to="/" replace />}
          />
          <Route
            path="/student-users"
            element={isAuthenticated && isAdmin ? <StudentUsers /> : <Navigate to="/" replace />}
          />
          <Route
            path="/student-dashboard"
            element={isAuthenticated && !isAdmin ? <StudentDashboard /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


