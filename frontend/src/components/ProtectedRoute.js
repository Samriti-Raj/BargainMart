import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // If not logged in → redirect to login with return URL
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If logged in but role mismatch → go home
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

