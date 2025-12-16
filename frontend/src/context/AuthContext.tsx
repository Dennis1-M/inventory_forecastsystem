// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  logoutUser: () => void;  // Add this
  deleteAccount: () => Promise<boolean>;  // Add this
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Remove the duplicate checkAuth function at the top (lines 15-57)
  // Keep only the useEffect below

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:5001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);

      // Redirect based on role
      redirectBasedOnRole(data.user.role);
      
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Alias logoutUser to logout (or rename logout to logoutUser)
  const logoutUser = () => {
    logout();
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      return true;
    } catch (error: any) {
      console.error('Delete account error:', error);
      alert(error.message || 'Failed to delete account');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        navigate('/superadmin');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'STAFF':
        navigate('/staff');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      logoutUser, // Add this
      deleteAccount, // Add this
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};