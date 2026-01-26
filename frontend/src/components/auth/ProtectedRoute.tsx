// frontend/src/components/auth/ProtectedRoute.tsx
// A component that protects routes based on user authentication and roles.
// It checks if a user is logged in and optionally verifies if the user has one of the allowed roles.
// If the user is not authenticated, it redirects to the login page.
// If the user does not have the required role, it redirects to the home page.
// Dependencies: React, react-router-dom (for navigation), useAuth (custom hook for auth context)
// Note: Ensure that useAuth is properly implemented to provide user authentication status and details.



import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const auth = useAuth();
  const user = auth?.user;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;