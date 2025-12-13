import { Navigate } from "react-router-dom";

// Props:
// - children: the page/component to render
// - requiredRole: string or array of roles allowed to access this route
export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // If requiredRole is defined, check user's role
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />; // Or redirect to a "Not Authorized" page
    }
  }

  return children;
}
