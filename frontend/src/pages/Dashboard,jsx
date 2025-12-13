import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    switch (role) {
      case "SUPERADMIN":
      case "ADMIN":
        navigate("/admin/dashboard");
        break;
      case "MANAGER":
        navigate("/manager/dashboard");
        break;
      case "STAFF":
        navigate("/staff/dashboard");
        break;
      default:
        navigate("/login");
        break;
    }
  }, [role, navigate]);

  return null;
}
