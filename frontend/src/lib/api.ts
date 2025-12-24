// frontend/src/services/api.ts
import { authService } from '@/services/authService';
import axios from "axios";
// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // required if backend uses cookies
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.clearAuthData();
      if (!window.location.pathname.includes("/login")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// ======================
// Test backend connection
// ======================
export const testBackendConnection = async () => {
  const token = authService.getToken();
  if (!token) {
    return { success: false, error: "No token found", requiresLogin: true };
  }

  try {
    const response = await api.get("/users", { timeout: 5000 });
    return {
      success: true,
      status: response.status,
      endpoint: "/users",
      message: "Backend connected successfully",
      hasAuth: true,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, error: "Token invalid", requiresLogin: true };
    }
    return { success: false, error: error.message, requiresLogin: false };
  }
};

// ======================
// API methods for dashboard
// ======================
export const inventoryAPI = {
  getUsers: async () => {
    const response = await api.get("/auth/users"); // fixed route
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get("/products");
    return response.data;
  },

  getSalesSummary: async () => {
    const response = await api.get("/sales/summary");
    return response.data;
  },

  getInventorySummary: async () => {
    const response = await api.get("/inventory/summary");
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get("/alerts");
    return response.data;
  },

  getForecasts: async () => {
    const response = await api.get("/forecasts");
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  testAllEndpoints: async () => {
    const endpoints = [
      { name: "Users", url: "/auth/users" },
      { name: "Products", url: "/products" },
      { name: "Sales", url: "/sales" },
      { name: "Inventory", url: "/inventory" },
      { name: "Alerts", url: "/alerts" },
      { name: "Forecasts", url: "/forecasts" },
      { name: "Admin Stats", url: "/admin/stats" },
      { name: "Admin Dashboard", url: "/admin/dashboard" },
    ];

    const results = [];
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint.url);
        results.push({
          name: endpoint.name,
          success: true,
          status: response.status,
          data: response.data ? "Has data" : "Empty",
        });
      } catch (error: any) {
        results.push({
          name: endpoint.name,
          success: false,
          error: error.message,
          status: error.response?.status,
        });
      }
    }

    return results;
  },
};

export default api;
