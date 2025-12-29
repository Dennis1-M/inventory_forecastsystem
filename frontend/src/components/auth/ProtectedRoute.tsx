// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but role not allowed → unauthorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Optional helper (kept, no auto-redirect usage)
export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin';
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager';
    case 'STAFF':
      return '/staff';
    default:
      return '/';
  }
}
