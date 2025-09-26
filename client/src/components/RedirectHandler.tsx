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
        
        // Security: Validate redirect URL to prevent Open Redirect attacks
        const validateAndRedirect = (url: string): void => {
          try {
            const parsedUrl = new URL(url, window.location.origin);
            
            // Security: Restrict to same-origin in production, localhost only in development
            const allowedOrigins = import.meta.env.PROD 
              ? [window.location.origin]
              : [
                  window.location.origin,
                  'http://localhost:5000',
                  'http://localhost:3000',
                  'https://localhost:5000',
                  'https://localhost:3000'
                ];
            
            if (allowedOrigins.includes(parsedUrl.origin)) {
              // Security: Additional validation before redirect
              const cleanUrl = parsedUrl.href.replace(/[<>"'`]/g, '');
              if (cleanUrl === parsedUrl.href) {
                window.location.assign(parsedUrl.href);
              } else {
                console.warn('Potentially malicious URL blocked:', parsedUrl.href);
                window.location.assign('/dashboard');
              }
            } else {
              // Redirect to safe default if URL is not trusted
              console.warn('Unsafe redirect URL blocked:', url);
              window.location.href = '/dashboard';
            }
          } catch (error) {
            // Invalid URL format, redirect to safe default
            console.warn('Invalid redirect URL format:', url);
            window.location.href = '/dashboard';
          }
        };
        
        // Small delay to ensure authentication state is stable
        setTimeout(() => {
          validateAndRedirect(redirectUrl);
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading]);

  return null; // This component renders nothing - purely functional
}