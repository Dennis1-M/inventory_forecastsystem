import axiosClient from "../lib/axiosClient";
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
    const role = localStorage.getItem("role");

    if (token && user) {
      set({ token, user, role: role || user?.role || null });
    } else {
      set({ user: null, token: null, role: null });
    }
  },

  // -----------------------
  // LOGIN
  // -----------------------
  login: async (email, password, role = null) => {
    try {
      set({ error: null });

      const payload = { email, password };
      if (role) payload.role = role;

      const res = await axiosClient.post(`/api/auth/login`, payload);

      const { user, token } = res.data;

      // Store in state
      set({ user, token, role: user.role });

      // Persist
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      // Return user for caller to decide navigation
      return user;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
      throw err;
    }
  },

  // -----------------------
  // LOGOUT (EXPLICIT)
  // -----------------------
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    set({ user: null, token: null, role: null });

    // Force reset of app
    window.location.href = "/login";
  },
  // -----------------------
  // REGISTER (SUPERADMIN)
  // -----------------------
  registerSuperAdmin: async (name, email, password) => {
    try {
      set({ error: null });
      const res = await axiosClient.post(`/api/auth/register-superadmin`, {
        name,
        email,
        password,
      });

      const { user, token } = res.data;
      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        set({ user, token, role: user.role });
      }
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message });
      throw err;
    }
  },

  // -----------------------
  // REGISTER USER (ADMIN/SUPERADMIN)
  // -----------------------
  registerUser: async (userData) => {
    try {
      set({ error: null });
      const res = await axiosClient.post(`/api/auth/register`, userData);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message });
      throw err;
    }
  },
}));
