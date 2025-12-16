// src/services/api.ts

const API_BASE_URL = 'http://localhost:5001/api';

// Generic API response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic fetch function with auth
// Update your existing api.ts with better error handling
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle unauthorized globally
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      // Try to get error message from response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
    
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};

// User API Service
export const userApi = {
  getAllUsers: () => apiFetch<any>('/admin/users'),
  getUser: (id: number) => apiFetch<any>(`/admin/users/${id}`),
  createUser: (userData: any) => apiFetch<any>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUser: (id: number, userData: any) => apiFetch<any>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  deleteUser: (id: number) => apiFetch<any>(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
};

// Product API Service
export const productApi = {
  getAllProducts: () => apiFetch<any>('/admin/products'),
  getProduct: (id: number) => apiFetch<any>(`/admin/products/${id}`),
  createProduct: (productData: any) => apiFetch<any>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  updateProduct: (id: number, productData: any) => apiFetch<any>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  deleteProduct: (id: number) => apiFetch<any>(`/admin/products/${id}`, {
    method: 'DELETE',
  }),
};

// Inventory API Service
export const inventoryApi = {
  getInventory: () => apiFetch<any>('/admin/inventory'),
  updateStock: (productId: number, quantity: number) => 
    apiFetch<any>(`/admin/inventory/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  getLowStock: () => apiFetch<any>('/admin/inventory/low-stock'),
};

// Sales API Service
export const salesApi = {
  getAllSales: () => apiFetch<any>('/admin/sales'),
  getSalesStats: () => apiFetch<any>('/admin/sales/stats'),
  getRecentOrders: () => apiFetch<any>('/admin/sales/recent'),
};

// Analytics API Service
export const analyticsApi = {
  getDashboardStats: () => apiFetch<any>('/admin/analytics/dashboard'),
  getRevenueChart: (period: string = 'monthly') => 
    apiFetch<any>(`/admin/analytics/revenue?period=${period}`),
  getUserGrowth: () => apiFetch<any>('/admin/analytics/user-growth'),
};