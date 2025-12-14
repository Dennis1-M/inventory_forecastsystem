import axiosClient from "@/lib/axiosClient";
import { useEffect, useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Check if user is authorized to register (ADMIN or SUPERADMIN)
  const isAuthorized = token && (userRole === "SUPERADMIN" || userRole === "ADMIN");

  useEffect(() => {
    if (!isAuthorized) {
      window.location.href = "/login";
    }
  }, [isAuthorized]);

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: newRole.toUpperCase(),
      };

      // Use auth store helper which will use axiosClient and handle errors
      const registerUser = (await import("../store/auth")).useAuth.getState().registerUser;
      await registerUser(userData);

      setSuccessMessage(`✅ ${newRole.toUpperCase()} registered successfully!`);
      setName(""); setEmail(""); setPassword(""); setNewRole("admin");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed";
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left visual panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-pink-500 text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            {userRole === "SUPERADMIN" ? "👑 Build Your Team" : "📋 Add Team Members"}
          </h2>
          <div className="space-y-4 text-sm">
            <p className="flex items-start gap-3">
              <span className="text-2xl font-bold opacity-50">1</span>
              <span>
                {userRole === "SUPERADMIN"
                  ? "Register ADMIN accounts to manage operations"
                  : "Register MANAGER and STAFF accounts"}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl font-bold opacity-50">2</span>
              <span>Provide their name, email, and password</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl font-bold opacity-50">3</span>
              <span>Share login details with them securely</span>
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white border-opacity-20 w-full">
            <p className="text-sm opacity-90 mb-4">
              <strong>✓ You can register:</strong><br/>
              {userRole === "SUPERADMIN" ? "Admin, Manager, Staff" : "Manager, Staff"}
            </p>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg text-sm">
              Logged in as: <strong>{userRole}</strong>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-10 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {userRole === "SUPERADMIN" ? "Register New User" : "Register Team Member"}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Create a new account for your team
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Logged in as:</strong> {userRole}
            </div>
          </div>

          <form onSubmit={handleRegisterUser} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                placeholder="e.g., Sarah Johnson"
                className="relative z-10 mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                placeholder="sarah@company.com"
                className="relative z-10 mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                placeholder="Set initial password (secure)"
                className="relative z-10 mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Share this password securely with the user</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700">Role *</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="relative z-10 mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {userRole === "SUPERADMIN" && (
                  <>
                    <option value="admin">⚙️ Admin</option>
                    <option value="manager">📦 Manager</option>
                    <option value="staff">👷 Staff</option>
                  </>
                )}
                {userRole === "ADMIN" && (
                  <>
                    <option value="manager">📦 Manager</option>
                    <option value="staff">👷 Staff</option>
                  </>
                )}
              </select>
            </div>

            {/* Error & Success Messages */}
            {localError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold">Registration Error</p>
                  <p>{localError}</p>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start gap-2">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-semibold">Success!</p>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "🔄 Registering..." : `✓ Register ${newRole.toUpperCase()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
