import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireAuth({ allowedRoles = [] }) {
  const { role, isLoggedIn } = useSelector((state) => state.auth);
  const { isInitialized, isRefreshing } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being initialized
  if (!isInitialized || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is authenticated and has required role
  if (isLoggedIn && allowedRoles.includes(role)) {
    return <Outlet />;
  }

  // If user is authenticated but doesn't have required role
  if (isLoggedIn) {
    return <Navigate to="/denied" state={{ from: location }} replace />;
  }

  // If user is not authenticated, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
}
