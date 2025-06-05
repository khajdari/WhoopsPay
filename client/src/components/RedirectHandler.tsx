/**
 * RedirectHandler Component - Post-authentication URL redirection
 * 
 * Handles automatic redirection after successful login for external payment flows.
 * Manages session storage for redirect URLs and ensures users return to their
 * intended destination after authentication (especially for Juice Shop integration).
 */
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * RedirectHandler - Invisible component managing post-login redirects
 * 
 * Features:
 * - Monitors authentication state changes
 * - Retrieves stored redirect URLs from session storage
 * - Automatically redirects authenticated users to intended destinations
 * - Cleans up session storage after successful redirect
 * - Essential for external payment approval flows
 */
export function RedirectHandler() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only proceed when authentication check is complete and user is authenticated
    if (!isLoading && isAuthenticated) {
      // Check if there's a stored redirect URL from before login
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectUrl) {
        // Clear the stored URL to prevent repeated redirects
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Small delay to ensure authentication state is stable
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading]);

  return null; // This component renders nothing - purely functional
}