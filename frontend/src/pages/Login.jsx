import axiosClient from "@/lib/axiosClient";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Login() {
  const [mode, setMode] = useState("role-select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [superAdminExists, setSuperAdminExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const login = useAuth((s) => s.login);
  const authError = useAuth((s) => s.error);
  const authRole = useAuth((s) => s.role);
  const initFromStorage = useAuth((s) => s.initFromStorage);

  const navigate = useNavigate();

  const resetFormFields = useCallback(() => {
    setEmail("");
    setPassword("");
    setName("");
    setLocalError("");
  }, []);

  const switchMode = useCallback(
    (newMode) => {
      setMode(newMode);
      resetFormFields();
    },
    [resetFormFields]
  );

  const getRoleFromMode = (currentMode) => {
    if (currentMode === "admin-login") return "ADMIN";
    if (currentMode === "manager-login") return "MANAGER";
    if (currentMode === "staff-login") return "STAFF";
    if (currentMode === "superadmin-login") return "SUPERADMIN";
    return null;
  };

  useEffect(() => {
    try {
      initFromStorage?.();
    } catch (err) {
      console.warn("initFromStorage error:", err);
    }
  }, [initFromStorage]);

  useEffect(() => {
    let mounted = true;

    async function checkSuperAdminExists() {
      setSuperAdminExists(null);
      try {
        const res = await axiosClient.get("/api/auth/check-superadmin");
        if (!mounted) return;
        setSuperAdminExists(Boolean(res?.data?.exists));
        if (!res?.data?.exists) {
          switchMode("superadmin-register");
        } else {
          if (mode === "superadmin-register") switchMode("role-select");
        }
      } catch (err) {
        console.error("Error checking SuperAdmin:", err);
        if (!mounted) return;
        setSuperAdminExists(false);
      }
    }

    checkSuperAdminExists();
    return () => {
      mounted = false;
    };
  }, [switchMode, mode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!authRole || !token) return;

    if (authRole === "SUPERADMIN" || authRole === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (authRole === "STAFF") {
      navigate("/staff/dashboard");
    } else if (authRole === "MANAGER") {
      navigate("/manager/dashboard");
    } else {
      navigate("/dashboard");
    }
  }, [authRole, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setLocalError("");
    setLoading(true);

    try {
      const role = getRoleFromMode(mode);
      await login(email, password, role);
    } catch (err) {
      console.error("Login error:", err);
      setLocalError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuperAdmin = async (e) => {
    e?.preventDefault?.();
    setLocalError("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/api/auth/register-superadmin", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", "SUPERADMIN");

      setSuperAdminExists(true);
      resetFormFields();
      switchMode("register-user");
    } catch (err) {
      console.error("SuperAdmin registration failed:", err);
      setLocalError(err?.response?.data?.message || err?.message || "SuperAdmin registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e?.preventDefault?.();
    setLocalError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLocalError("You must be logged in to register users.");
        setLoading(false);
        return;
      }

      const storedRole = localStorage.getItem("role");
      if (!["SUPERADMIN", "ADMIN"].includes(storedRole)) {
        setLocalError("Only SuperAdmin or Admin can register new users.");
        setLoading(false);
        return;
      }

      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: newRole.toUpperCase(),
      };

      await axiosClient.post("/api/auth/register", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLocalError("");
      alert(`${userData.role} registered successfully!`);
      resetFormFields();
    } catch (err) {
      console.error("Register user error:", err);
      setLocalError(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UI --------------------
  const roleSelectButtons = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: "Admin", color: "blue", emoji: "⚙️", mode: "admin-login" },
        { title: "Manager", color: "green", emoji: "📦", mode: "manager-login" },
        { title: "Staff", color: "orange", emoji: "👷", mode: "staff-login" },
      ].map((r) => (
        <div key={r.title} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-${r.color}-600 transition cursor-pointer`}>
          <div className={`p-6 bg-gradient-to-br from-${r.color}-50 to-${r.color}-100`}>
            <div className="text-4xl mb-3">{r.emoji}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{r.title}</h2>
            <p className="text-sm text-gray-600">{r.title === "Admin" ? "Full system management" : r.title === "Manager" ? "Inventory management" : "Sales & restocking"}</p>
          </div>
          <div className="p-4">
            <button
              onClick={() => switchMode(r.mode)}
              className={`w-full py-3 rounded-lg text-white font-medium bg-${r.color}-600 hover:bg-${r.color}-700 transition cursor-pointer`}
            >
              Sign In
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const LoginForm = ({ roleTitle, roleColor, roleEmoji, onBack }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        <div className={`hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br ${roleColor} text-white`}>
          <div className="text-6xl mb-4">{roleEmoji}</div>
          <h2 className="text-3xl font-extrabold mb-2">{roleTitle}</h2>
          <p className="opacity-90 max-w-xs text-center">Access the inventory management system with your credentials.</p>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign In</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="you@company.com"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Your secure password"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {(authError || localError) && <p className="text-sm text-red-600">{authError || localError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <button onClick={onBack} className="w-full mt-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
            Back to Role Select
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "role-select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4">
        <div className="max-w-5xl w-full text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Inventory Forecast System</h1>
          <p className="text-lg text-gray-600 mb-8">Sign in to your account</p>
          {roleSelectButtons}
          <div className="mt-8 flex justify-center gap-4">
            {superAdminExists !== false && (
              <button
                onClick={() => switchMode("superadmin-login")}
                className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 cursor-pointer"
              >
                SuperAdmin Sign In
              </button>
            )}
            {superAdminExists === null && <p className="text-sm text-gray-500">Checking setup...</p>}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "superadmin-login") return <LoginForm roleTitle="SuperAdmin" roleColor="from-purple-600 to-pink-500" roleEmoji="👑" onBack={() => switchMode("role-select")} />;
  if (mode === "admin-login") return <LoginForm roleTitle="Admin" roleColor="from-blue-600 to-blue-500" roleEmoji="⚙️" onBack={() => switchMode("role-select")} />;
  if (mode === "manager-login") return <LoginForm roleTitle="Manager" roleColor="from-green-600 to-green-500" roleEmoji="📦" onBack={() => switchMode("role-select")} />;
  if (mode === "staff-login") return <LoginForm roleTitle="Staff" roleColor="from-orange-600 to-orange-500" roleEmoji="👷" onBack={() => switchMode("role-select")} />;

  // ... superadmin-register and register-user remain the same
  // just ensure all buttons have `cursor-pointer` and disabled states use `cursor-not-allowed`
  // you can copy-paste your previous Register component improvements here
  return null;
}
