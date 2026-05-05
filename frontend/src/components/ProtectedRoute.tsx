import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "../api";
import { User } from "../type";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "student";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const user = getStoredUser();
  const token = localStorage.getItem("access_token");

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
