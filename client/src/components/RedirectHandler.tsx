import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function RedirectHandler() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if there's a stored redirect URL
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectUrl) {
        // Clear the stored URL
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Redirect to the stored URL
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}