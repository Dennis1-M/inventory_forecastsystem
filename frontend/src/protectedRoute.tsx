// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  
  console.log("🛡️ ProtectedRoute check:", { 
    userRole: user?.role,
    allowedRoles,
    hasToken: !!token
  });
  
  // If no token, redirect to login
  if (!token) {
    console.log("❌ No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified but user doesn't have an allowed role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      console.log(`🚫 Access denied. User role: ${user?.role}, Allowed roles: ${allowedRoles}`);
      return <Navigate to="/not-authorized" replace />;
    }
  }
  
  console.log("✅ Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;