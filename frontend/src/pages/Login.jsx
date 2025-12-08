import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuth((s) => s.login);
  const error = useAuth((s) => s.error);
  const userRole = useAuth((s) => s.role);
  const initFromStorage = useAuth((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
    if (userRole) {
      if (userRole === "ADMIN") window.location.href = "/admin/dashboard";
      else if (userRole === "STAFF") window.location.href = "/staff/dashboard";
      else if (userRole === "MANAGER") window.location.href = "/manager/dashboard";
    }
  }, [userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password, role);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-lg rounded-xl w-96"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
        </select>

        <input
          placeholder="Email"
          className="border p-2 rounded w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
