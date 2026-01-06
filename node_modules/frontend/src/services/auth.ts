import apiService from './api';

// Auth Service for JWT token management
export const authService = {
  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  // Get auth headers with token
  getAuthHeaders: (): HeadersInit => {
    const token = authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  // Login endpoint
  login: async (email: string, password: string) => {
    const response = await apiService.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout endpoint
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // No API call needed for simple logout, but you could have one to invalidate the token server-side
  },

  // Refresh token endpoint
  refreshToken: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/refresh', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.token) {
        authService.setToken(data.token);
      }
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      authService.removeToken();
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  // Get user from token (simple JWT decode without verification - for client side only)
  getUserFromToken: () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};
