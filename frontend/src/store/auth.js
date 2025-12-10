import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuth = create((set) => ({
  user: null,
  token: null,
  role: null,
  error: null,

  // -----------------------
  // LOGIN FUNCTION
  // -----------------------
  login: async (email, password) => {
    try {
      set({ error: null });

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const user = res.data.user;
      const token = res.data.token;

      // Always use backend role – safer
      set({ user, token, role: user.role });

      // Persist
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // Redirect per role
      if (user.role === "ADMIN") window.location.href = "/admin/dashboard";
      else if (user.role === "MANAGER") window.location.href = "/manager/dashboard";
      else if (user.role === "STAFF") window.location.href = "/staff/dashboard";

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
    }
  },

  // -----------------------
  // LOGOUT FUNCTION
  // -----------------------
  logout: () => {
    set({ user: null, token: null, role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  },

  // -----------------------
  // INIT FROM STORAGE
  // -----------------------
  initFromStorage: () => {
    // Always start fresh - require login every time app reloads
    // This ensures users must provide credentials and system has current auth state
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    set({ user: null, token: null, role: null });
  },
}));
