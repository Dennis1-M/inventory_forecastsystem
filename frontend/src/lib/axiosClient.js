import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add retry config
  config.retryCount = config.retryCount || 0;
  config.maxRetries = 3;

  return config;
});

// Handle responses with caching and retry logic
axiosClient.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === "get") {
      const cacheKey = response.config.url;
      requestCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    const config = error.config;

    // Handle 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Retry logic for network errors and 5xx errors
    if (
      config &&
      config.retryCount < config.maxRetries &&
      (!error.response || error.response.status >= 500 || !error.response)
    ) {
      config.retryCount += 1;
      const delay = Math.pow(2, config.retryCount) * 1000; // Exponential backoff
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axiosClient(config));
        }, delay);
      });
    }

    return Promise.reject(error);
  }
);

// Cache management utility
export const cacheManager = {
  get: (key) => {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    requestCache.delete(key);
    return null;
  },
  set: (key, value) => {
    requestCache.set(key, { data: value, timestamp: Date.now() });
  },
  clear: () => requestCache.clear(),
  clearKey: (key) => requestCache.delete(key),
};

// Wrapper for cached GET requests
export const getCached = async (url, config = {}) => {
  const cached = cacheManager.get(url);
  if (cached) return cached;
  return axiosClient.get(url, config);
};

export default axiosClient;
