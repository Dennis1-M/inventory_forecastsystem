import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuth = create((set) => ({
  user: null,
  token: null,
  role: null,
  error: null,

  // -----------------------
  // INIT FROM STORAGE (FIXED)
  // -----------------------
  initFromStorage: () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user) {
      set({ token, user, role: user.role });
    } else {
      set({ user: null, token: null, role: null });
    }
  },

  // -----------------------
  // LOGIN
  // -----------------------
  login: async (email, password) => {
    try {
      set({ error: null });

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user, token } = res.data;

      // Store in state
      set({ user, token, role: user.role });

      // Persist
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // HARD redirect per role (important)
      switch (user.role) {
        case "SUPERADMIN":
        case "ADMIN":
          window.location.href = "/admin/dashboard";
          break;
        case "MANAGER":
          window.location.href = "/manager/dashboard";
          break;
        case "STAFF":
          window.location.href = "/staff/dashboard";
          break;
        default:
          window.location.href = "/";
      }

    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
    }
  },

  // -----------------------
  // LOGOUT (EXPLICIT)
  // -----------------------
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, role: null });

    // Force reset of app
    window.location.href = "/login";
  },
}));
