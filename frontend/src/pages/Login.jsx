import axiosClient from "@/lib/axiosClient";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";

export default function Login() {
  // Modes: role-select, superadmin-login, superadmin-register, admin-login, staff-login, manager-login, register-user
  const [mode, setMode] = useState("role-select");
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const login = useAuth((s) => s.login);
  const error = useAuth((s) => s.error);
  const userRole = useAuth((s) => s.role);
  const initFromStorage = useAuth((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
    checkSuperAdminExists();
    if (userRole) {
      if (userRole === "SUPERADMIN") window.location.href = "/admin/dashboard";
      else if (userRole === "ADMIN") window.location.href = "/admin/dashboard";
      else if (userRole === "STAFF") window.location.href = "/staff/dashboard";
      else if (userRole === "MANAGER") window.location.href = "/manager/dashboard";
    }
  }, [userRole]);

  async function checkSuperAdminExists() {
    try {
      const res = await axiosClient.get("/api/auth/check-superadmin");
      setSuperAdminExists(res.data.exists);
      if (!res.data.exists) {
        setMode("superadmin-register");
      }
    } catch (err) {
      console.error("Error checking SuperAdmin:", err);
      setSuperAdminExists(false);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    await login(email, password);
  };

  const handleRegisterSuperAdmin = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    try {
      const res = await axiosClient.post("/api/auth/register-superadmin", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "SUPERADMIN");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      setName("");
      setEmail("");
      setPassword("");
      setNewRole("admin");
      setMode("register-user");
      setSuperAdminExists(true);
      setLocalError(""); // Clear any previous errors
    } catch (err) {
      const message = err.response?.data?.message || "SuperAdmin registration failed";
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLocalError("You must be logged in to register users");
        setLoading(false);
        return;
      }

      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: newRole.toUpperCase(),
      };

      console.log("Registering user with:", userData);
      console.log("Token:", token ? "✓ Present" : "✗ Missing");

      const res = await axiosClient.post("/api/auth/register", userData);
      
      console.log("Registration successful:", res.data);
      setLocalError("");
      alert(`${newRole.toUpperCase()} registered successfully!`);
      setName("");
      setEmail("");
      setPassword("");
      setNewRole("admin");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed";
      console.error("Registration error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== ROLE SELECT PAGE ====================
  if (mode === "role-select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Inventory Forecast System</h1>
            <p className="text-lg text-gray-600">Sign in to your account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-600 transition">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-4xl mb-3">⚙️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Admin</h2>
                <p className="text-sm text-gray-600">Full system management</p>
              </div>

              <div className="p-4">
                <button
                  onClick={() => { setMode("admin-login"); setEmail(""); setPassword(""); setLocalError(""); }}
                  className="w-full py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Manager */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-green-600 transition">
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-4xl mb-3">📦</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Manager</h2>
                <p className="text-sm text-gray-600">Inventory management</p>
              </div>
              <div className="p-4">
                <button
                  onClick={() => { setMode("manager-login"); setEmail(""); setPassword(""); setLocalError(""); }}
                  className="w-full py-3 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Staff */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-orange-600 transition">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-4xl mb-3">👷</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Staff</h2>
                <p className="text-sm text-gray-600">Sales & restocking</p>
              </div>
              <div className="p-4">
                <button
                  onClick={() => { setMode("staff-login"); setEmail(""); setPassword(""); setLocalError(""); }}
                  className="w-full py-3 rounded-lg text-white font-medium bg-orange-600 hover:bg-orange-700 transition"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LOGIN FORM COMPONENT ====================
  const LoginForm = ({ roleTitle, roleColor, roleEmoji, onBack }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left visual panel */}
        <div className={`hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br ${roleColor} text-white`}>
          <div className="text-6xl mb-4">{roleEmoji}</div>
          <h2 className="text-3xl font-extrabold mb-2">{roleTitle}</h2>
          <p className="opacity-90 max-w-xs text-center">Access the inventory management system with your credentials.</p>
          <div className="mt-6 w-full flex items-center justify-center">
            <div className="h-1 w-20 bg-white opacity-30 rounded-full mr-3" />
            <div className="h-1 w-10 bg-white opacity-20 rounded-full" />
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
            <p className="text-sm text-gray-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                placeholder="you@company.com"
                className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Your secure password"
                className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a className="text-sm text-purple-600 hover:underline" href="#">Forgot?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition"
            >
              Sign In
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition"
          >
            Back to Role Select
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== SUPERADMIN LOGIN ====================
  if (mode === "superadmin-login") {
    return <LoginForm roleTitle="SuperAdmin" roleColor="from-purple-600 to-pink-500" roleEmoji="👑" onBack={() => setMode("role-select")} />;
  }

  // ==================== SUPERADMIN REGISTER ====================
  if (mode === "superadmin-register" && !superAdminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-pink-500 text-white">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-extrabold mb-2">First Time Setup</h2>
            <p className="opacity-90 max-w-xs text-center">Create your SuperAdmin account to manage the entire system. You'll be the owner of this application.</p>
            <div className="mt-6 w-full flex items-center justify-center">
              <div className="h-1 w-20 bg-white opacity-30 rounded-full mr-3" />
              <div className="h-1 w-10 bg-white opacity-20 rounded-full" />
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Register SuperAdmin</h1>
              <p className="text-sm text-gray-500">You are the first user - become the system owner</p>
            </div>

            <form onSubmit={handleRegisterSuperAdmin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  placeholder="Your name"
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Password</label>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {localError && <p className="text-sm text-red-600">{localError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create SuperAdmin Account"}
              </button>
            </form>

            <button
              onClick={() => setMode("role-select")}
              className="w-full mt-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition"
            >
              Back to Role Select
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ADMIN LOGIN ====================
  if (mode === "admin-login") {
    return <LoginForm roleTitle="Admin" roleColor="from-blue-600 to-blue-500" roleEmoji="⚙️" onBack={() => setMode("role-select")} />;
  }

  // ==================== MANAGER LOGIN ====================
  if (mode === "manager-login") {
    return <LoginForm roleTitle="Manager" roleColor="from-green-600 to-green-500" roleEmoji="📦" onBack={() => setMode("role-select")} />;
  }

  // ==================== STAFF LOGIN ====================
  if (mode === "staff-login") {
    return <LoginForm roleTitle="Staff" roleColor="from-orange-600 to-orange-500" roleEmoji="👷" onBack={() => setMode("role-select")} />;
  }

  // ==================== USER REGISTRATION ====================
  if (mode === "register-user") {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const canRegister = token && (userRole === "SUPERADMIN" || userRole === "ADMIN");

    if (!canRegister) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Only SuperAdmin or Admin can register new users.</p>
            <button
              onClick={() => setMode("role-select")}
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500"
            >
              Back to Role Select
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-pink-500 text-white">
            <h2 className="text-3xl font-extrabold mb-4">
              {userRole === "SUPERADMIN" ? "Build Your Team" : "Add Team Members"}
            </h2>
            <div className="space-y-4 text-sm">
              <p className="flex items-start gap-3">
                <span className="text-2xl font-bold opacity-50">1</span>
                <span>
                  {userRole === "SUPERADMIN" 
                    ? "Register ADMIN to manage operations"
                    : "Register MANAGER & STAFF"}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl font-bold opacity-50">2</span>
                <span>Provide their credentials</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl font-bold opacity-50">3</span>
                <span>Share login details with them</span>
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white border-opacity-20 w-full">
              <p className="text-sm opacity-90">
                {userRole === "SUPERADMIN" 
                  ? "You can register: ADMIN, MANAGER, STAFF"
                  : "You can register: MANAGER, STAFF"}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {userRole === "SUPERADMIN" ? "Register Admin" : "Register New User"}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {userRole === "SUPERADMIN" 
                  ? "Create your first Admin account to manage the system"
                  : "Add team members to the system"}
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                You're logged in as <strong>{userRole}</strong>
              </div>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  placeholder="e.g., John Smith"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="user@company.com"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Set initial password"
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {userRole === "SUPERADMIN" && (
                    <>
                      <option value="admin">Admin - Full system management</option>
                      <option value="manager">Manager - Inventory & stock management</option>
                      <option value="staff">Staff - Shelf restocking & sales</option>
                    </>
                  )}
                  {userRole === "ADMIN" && (
                    <>
                      <option value="manager">Manager - Inventory & stock management</option>
                      <option value="staff">Staff - Shelf restocking & sales</option>
                    </>
                  )}
                </select>
              </div>

              {localError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {localError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : `Register ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`}
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  {userRole === "SUPERADMIN" 
                    ? "Continue registering more users or proceed to dashboard:"
                    : "Continue registering more users or go back:"}
                </p>
                <div className="flex gap-3">
                  {userRole === "SUPERADMIN" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => window.location.href = "/register"}
                        className="flex-1 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition"
                      >
                        ➕ Add Another User
                      </button>
                      <button
                        type="button"
                        onClick={() => window.location.href = "/admin/dashboard"}
                        className="flex-1 py-2 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 transition"
                      >
                        Dashboard
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode("role-select")}
                      className="flex-1 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition"
                    >
                      Back to Role Select
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
