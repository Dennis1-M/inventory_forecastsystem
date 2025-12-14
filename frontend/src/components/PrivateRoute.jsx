// Tag: routing/auth
// Purpose: Route guard used in `App.jsx` to protect routes that require
// authentication and optionally a role. Returns an `<Outlet />` for nested
// routes when access is granted, otherwise redirects to login or home.
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function PrivateRoute({ requiredRole = null }) {
  const { user, token } = useAuth();

  // Tag: guard/not-authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Tag: guard/role-check - optional role-based authorization
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
