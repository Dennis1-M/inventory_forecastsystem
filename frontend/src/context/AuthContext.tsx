// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    console.log("🔄 AuthProvider initializing...");
    
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log("✅ Auth initialized from localStorage");
      } catch (error) {
        console.error("❌ Failed to parse stored user:", error);
        clearLocalStorage();
      }
    } else {
      console.log("ℹ️ No stored auth data found");
    }
    
    setIsInitialized(true);
  }, []);

  const loginUser = (user: User, token: string) => {
    console.log("💾 loginUser called for:", user.email);
    
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    
    console.log("✅ User logged in and saved to localStorage");
  };

  const logoutUser = async () => {
    console.log("🚪 Logout initiated for:", user?.email);
    
    try {
      // Optional: Notify backend about logout
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(err => {
          console.log("Note: Backend logout optional, frontend logout proceeding");
        });
      }
    } catch (error) {
      console.log("Logout notification to backend failed, continuing frontend logout");
    } finally {
      // Clear frontend state
      setUser(null);
      setToken(null);
      clearLocalStorage();
      console.log("✅ User logged out successfully");
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user || !token) {
      console.error("❌ Cannot delete: No user logged in");
      return false;
    }

    console.log("🗑️ Account deletion requested for:", user.email);

    if (!confirm(`Are you sure you want to delete your account (${user.email})? This action is irreversible!`)) {
      return false;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("✅ Account deleted successfully from backend");
        
        // Clear frontend state
        setUser(null);
        setToken(null);
        clearLocalStorage();
        
        return true;
      } else {
        const data = await response.json();
        console.error("❌ Failed to delete account:", data.message);
        alert(`Failed to delete account: ${data.message}`);
        return false;
      }
    } catch (error: any) {
      console.error("❌ Error deleting account:", error);
      alert(`Error deleting account: ${error.message}`);
      return false;
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberedEmail");
    console.log("🧹 localStorage cleared");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loginUser, 
      logoutUser, 
      deleteAccount,
      isInitialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};