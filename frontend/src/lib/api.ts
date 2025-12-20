import { authService } from '@/services/authService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    // console.error(`❌ API Error: ${error.config?.url} - ${error.response?.status || error.message}`);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      // console.log('Token invalid, redirecting to login...');
      authService.clearAuthData();
      
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

// Test backend connection with auth
export const testBackendConnection = async () => {
  // console.log('🔍 Testing backend connection...');
  
  const token = authService.getToken();
  
  if (!token) {
    return {
      success: false,
      error: 'No authentication token found. Please login first.',
      requiresLogin: true
    };
  }

  try {
    const response = await api.get('/users', { timeout: 5000 });
    
    return {
      success: true,
      endpoint: '/users',
      status: response.status,
      message: 'Backend connected successfully',
      hasAuth: true
    };
  } catch (error: any) {
    // console.error('Connection test failed:', error.message);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Authentication failed. Token may be expired.',
        requiresLogin: true
      };
    }
    
    return {
      success: false,
      error: `Cannot connect to backend: ${error.message}`,
      requiresLogin: false
    };
  }
};

// API methods for dashboard
export const inventoryAPI = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch users:', error.message);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch products:', error.message);
      throw error;
    }
  },

  getSalesSummary: async () => {
    try {
      const response = await api.get('/sales/summary');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch sales:', error.message);
      throw error;
    }
  },

  getInventorySummary: async () => {
    try {
      const response = await api.get('/inventory/summary');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch inventory:', error.message);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch alerts:', error.message);
      throw error;
    }
  },

  getForecasts: async () => {
    try {
      const response = await api.get('/forecasts');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch forecasts:', error.message);
      throw error;
    }
  },

  getAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch admin stats:', error.message);
      throw error;
    }
  },

  getAdminDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      // console.error('Failed to fetch admin dashboard:', error.message);
      throw error;
    }
  },

  testAllEndpoints: async () => {
    const endpoints = [
      { name: 'Users', url: '/users' },
      { name: 'Products', url: '/products' },
      { name: 'Sales', url: '/sales' },
      { name: 'Inventory', url: '/inventory' },
      { name: 'Alerts', url: '/alerts' },
      { name: 'Forecasts', url: '/forecasts' },
      { name: 'Admin Stats', url: '/admin/stats' },
      { name: 'Admin Dashboard', url: '/admin/dashboard' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint.url);
        results.push({
          name: endpoint.name,
          success: true,
          status: response.status,
          data: response.data ? 'Has data' : 'Empty'
        });
      } catch (error: any) {
        results.push({
          name: endpoint.name,
          success: false,
          error: error.message,
          status: error.response?.status
        });
      }
    }

    return results;
  }
};

export default api;
