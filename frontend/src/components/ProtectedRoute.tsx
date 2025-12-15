// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isInitialized } = useAuth();
  
  console.log("🛡️ ProtectedRoute check:", { 
    isInitialized,
    hasUser: !!user, 
    hasToken: !!token,
    userRole: user?.role,
    allowedRoles 
  });
  
  // Wait for auth to initialize
  if (!isInitialized) {
    console.log("⏳ Waiting for auth initialization...");
    return <div className="p-4">Loading authentication...</div>;
  }
  
  // Check localStorage directly as fallback
  const localStorageToken = localStorage.getItem("token");
  const localStorageUser = localStorage.getItem("user");
  
  console.log("📝 localStorage check:", { 
    hasLocalStorageToken: !!localStorageToken,
    hasLocalStorageUser: !!localStorageUser
  });
  
  // If no token anywhere, redirect to login
  if (!token && !localStorageToken) {
    console.log("❌ No token found in context or localStorage, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Determine user role
  const userRole = user?.role || (localStorageUser ? JSON.parse(localStorageUser).role : null);
  
  // If roles are specified but user doesn't have an allowed role
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      console.log(`🚫 Access denied. User role: ${userRole}, Allowed roles: ${allowedRoles}`);
      return <Navigate to="/not-authorized" replace />;
    }
  }
  
  console.log("✅ Access granted to:", window.location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;