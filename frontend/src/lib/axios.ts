// frontend/src/lib/axios.ts
import { authService } from "@/services/authService";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // in case backend uses cookies
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized globally
    if (status === 401) {
      console.warn("Unauthorized - clearing auth and redirecting to login");
      authService.clearAuthData();

      if (!window.location.pathname.includes("/login")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    // Optional: log all API errors
    console.error(`API Error [${status || "Network"}]:`, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;
