// src/contexts/AuthContext.tsx
import { authService } from '@/services/authService';
import type { LoginCredentials, SuperAdminSetup, User, UserRole } from '@/types/auth';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setupSuperAdmin: (data: SuperAdminSetup) => Promise<void>;
  deleteAccount: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Validate token with backend
        const validUser = await authService.getCurrentUser();
        if (validUser) {
          setUser(validUser);
        } else {
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const setupSuperAdmin = useCallback(async (data: SuperAdminSetup) => {
    const response = await authService.setupSuperAdmin(data);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    setupSuperAdmin,
    deleteAccount,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
