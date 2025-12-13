import axiosClient from "@/lib/axiosClient";
import { Eye, EyeOff, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    // Check if user is authorized (SUPERADMIN or ADMIN)
    if (!token || !userRole || !["SUPERADMIN", "ADMIN"].includes(userRole)) {
      navigate("/login");
    }
  }, []);

  // Determine which roles can be created
  const availableRoles =
    userRole === "SUPERADMIN" ? ["ADMIN", "MANAGER", "STAFF"] : ["MANAGER", "STAFF"];

  const roleDescriptions = {
    ADMIN: "Full system management, can create managers and staff",
    MANAGER: "Inventory management, stock control, and restocking",
    STAFF: "Sales processing and basic inventory operations",
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosClient.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Add to registered users list
      setRegisteredUsers([...registeredUsers, res.data.user]);

      setSuccess(`✓ ${role} registered successfully!`);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole(availableRoles[0]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-purple-300">
            Logged in as <span className="font-semibold">{userRole}</span> ({user?.name})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Register New Team Member</h2>
              <p className="text-gray-300 text-sm mb-6">
                {userRole === "SUPERADMIN"
                  ? "Create Admin, Manager, or Staff accounts"
                  : "Create Manager or Staff accounts"}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-green-200 text-sm">{success}</p>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="user@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">{roleDescriptions[role]}</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? "Registering..." : "Register User"}
                  <UserPlus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Registered Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Registered Users</h3>

              {registeredUsers.length === 0 ? (
                <p className="text-gray-400 text-sm">No users registered yet in this session.</p>
              ) : (
                <div className="space-y-3">
                  {registeredUsers.map((u, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white font-semibold text-sm">{u.name}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            u.role === "ADMIN"
                              ? "bg-blue-500/30 text-blue-200"
                              : u.role === "MANAGER"
                              ? "bg-green-500/30 text-green-200"
                              : "bg-orange-500/30 text-orange-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Role Legend */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3 font-semibold">Role Hierarchy:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-gray-300">SuperAdmin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-300">Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-300">Manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-gray-300">Staff</span>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="w-full mt-6 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white font-semibold rounded-lg transition text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
