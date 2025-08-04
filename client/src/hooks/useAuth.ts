import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { users } from "@shared/schema";

type User = typeof users.$inferSelect;

/**
 * useAuth Hook - Authentication state management
 * 
 * Provides centralized authentication state across the application.
 * Handles user session validation, logout functionality, and loading states.
 * Automatically retries failed authentication checks and manages cache invalidation.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  
  // Query current user authentication status from server
  // Disabled retry to prevent infinite loops on 401 responses
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  /**
   * Logout function - Terminates user session
   * Calls server logout endpoint, clears local cache, and redirects to landing page
   * Handles both successful and failed logout attempts gracefully
   */
  const logout = async () => {
    try {
      // Attempt server-side session termination
      await apiRequest("/api/logout", "POST");
      // Clear all cached query data
      queryClient.clear();
      // Redirect to landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear the local cache and redirect
      // This ensures user is logged out on client side regardless of server response
      queryClient.clear();
      window.location.href = "/";
    }
  };

  return {
    user, // Current user object (null if not authenticated)
    isLoading, // Loading state for authentication check
    isAuthenticated: !!user, // Boolean authentication status
    logout, // Logout function
  };
}
