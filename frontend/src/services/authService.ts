// frontend/src/service/authService.ts

import type { AuthResponse, LoginCredentials, SuperAdminSetup, User } from '@/types/auth';

// API base URL - configured for backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Storage keys
const TOKEN_KEY = 'inventory_token';
const USER_KEY = 'inventory_user';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  // Get stored token
  getToken(): string | null {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // Set auth data after login
  private setAuthData(response: AuthResponse): void {
    this.token = response.token;
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  // Clear auth data on logout
  clearAuthData(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Check if SuperAdmin exists (first-time setup)
  async checkSuperAdminExists(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-superadmin`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to check SuperAdmin status');

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking SuperAdmin:', error);
      return true; // default to true to show login if backend unavailable
    }
  }

  // Setup SuperAdmin (first-time system setup)
  async setupSuperAdmin(data: SuperAdminSetup): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register-superuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup SuperAdmin');
    }

    const authResponse: AuthResponse = await response.json();
    this.setAuthData(authResponse);
    return authResponse;
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid credentials');
    }

    const authResponse: AuthResponse = await response.json();
    this.setAuthData(authResponse);
    return authResponse;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Validate token / get current user
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const user: User = await response.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Delete account (requires backend route `/auth/delete-account`)
  async deleteAccount(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }

    this.clearAuthData();
  }
}

// Export singleton instance
export const authService = new AuthService();
