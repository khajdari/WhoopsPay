import { useState, useEffect } from "react";
import { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for logged in user (VULNERABLE: insecure storage)
    try {
      const storedUser = localStorage.getItem("insecurePay_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("insecurePay_user");
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("insecurePay_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("insecurePay_user");
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
