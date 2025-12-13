import axiosClient from "@/lib/axiosClient";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AuthLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [superAdminExists, setSuperAdminExists] = useState(true);

  const login = useAuth((s) => s.login);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Check if user already logged in
    if (token && userRole) {
      if (userRole === "SUPERADMIN" || userRole === "ADMIN") navigate("/admin/dashboard");
      else if (userRole === "MANAGER") navigate("/manager/dashboard");
      else if (userRole === "STAFF") navigate("/staff/dashboard");
    }

    // Check if SuperAdmin exists
    checkSuperAdminExists();
  }, []);

  async function checkSuperAdminExists() {
    try {
      const res = await axiosClient.get("/api/auth/check-superadmin");
      setSuperAdminExists(res.data.exists);
    } catch (err) {
      console.error("Error checking SuperAdmin:", err);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Auth store handles navigation after successful login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Forecast System</h1>
          <p className="text-purple-300">Smart inventory management & demand forecasting</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* SuperAdmin Not Exists Warning */}
          {!superAdminExists && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>First Time Setup:</strong> No SuperAdmin exists. Please{" "}
                <button
                  onClick={() => navigate("/auth/register-superadmin")}
                  className="underline font-semibold hover:text-yellow-100"
                >
                  register as SuperAdmin
                </button>
                {" "}first.
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p className="text-gray-300">
                  <span className="text-purple-300">Email:</span> admin@example.com
                </p>
                <p className="text-gray-300">
                  <span className="text-purple-300">Password:</span> admin123
                </p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          {superAdminExists && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                New user?{" "}
                <button
                  onClick={() => navigate("/auth/register-superadmin")}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline"
                >
                  Register as SuperAdmin
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          <p>© 2025 Inventory Forecast System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
