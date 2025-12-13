import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

 // Props:
 // - requiredRole: string or array of roles allowed to access this route 
export default function PrivateRoute({ requiredRole = null }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
