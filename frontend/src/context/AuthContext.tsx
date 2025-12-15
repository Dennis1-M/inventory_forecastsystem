// context/AuthContext.tsx - Add this useEffect
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
  isInitialized: boolean; // Add this
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Add this

  // Initialize from localStorage on mount
  useEffect(() => {
    console.log("🔄 AuthProvider initializing...");
    
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    console.log("📝 Stored data:", { storedUser: !!storedUser, storedToken: !!storedToken });
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log("✅ Auth initialized from localStorage:", {
          user: parsedUser.email,
          role: parsedUser.role,
          tokenLength: storedToken.length
        });
      } catch (error) {
        console.error("❌ Failed to parse stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      console.log("ℹ️ No stored auth data found");
    }
    
    setIsInitialized(true);
  }, []);

  const loginUser = (user: User, token: string) => {
    console.log("💾 loginUser called with:", { 
      userEmail: user.email, 
      userRole: user.role,
      tokenLength: token.length 
    });
    
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    
    console.log("✅ Auth state updated and saved to localStorage");
  };

  const logoutUser = () => {
    console.log("🚪 Logging out...");
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("✅ Logged out and localStorage cleared");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};