import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useAuth = create((set) => ({
  user: null,
  token: null,
  role: null,
  error: null, // store error message

  login: async (email, password, selectedRole) => {
    try {
      set({ error: null }); // reset previous error

      // convert role to uppercase
      const role = selectedRole.toUpperCase();

      const res = await axios.post(`${API_URL}/api/auth/login`, {
  email,
  password,
});

      const user = res.data.user;
      const token = res.data.token;

      set({ user, token, role });

      // persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // redirect based on role
      if (role === "ADMIN") window.location.href = "/admin/dashboard";
      else if (role === "STAFF") window.location.href = "/staff/dashboard";
      else if (role === "MANAGER") window.location.href = "/manager/dashboard";
    } catch (err) {
      console.error(err);
      // show backend message if available
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
    }
  },

  logout: () => {
    set({ user: null, token: null, role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  },

  initFromStorage: () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) set({ token, role });
  },
}));
