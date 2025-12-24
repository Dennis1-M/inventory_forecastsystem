// User roles - must match backend enum
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';

// User interface from backend
export interface User {
  id: string;
  name: string;   
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}


// Auth response from login
export interface AuthResponse {
  token: string;
  user: User;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// SuperAdmin setup payload
export interface SuperAdminSetup {
  email: string;
  password: string;
  name: string; 
}

// Auth context state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
// Auth context methods