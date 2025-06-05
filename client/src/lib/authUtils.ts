/**
 * Authentication Utility Functions - Error detection and handling
 * 
 * Provides utility functions for detecting and handling authentication-related
 * errors throughout the WhoopsPay application. Used for consistent error
 * handling and user experience across different components.
 */

/**
 * Unauthorized Error Detector - Identifies 401 authentication errors
 * 
 * Checks if an error represents an unauthorized (401) HTTP response.
 * Used throughout the application to detect when users need to re-authenticate
 * and trigger appropriate login flows or error messages.
 * 
 * @param error - Error object to examine
 * @returns true if error represents a 401 Unauthorized response
 * 
 * @example
 * ```typescript
 * try {
 *   await apiRequest('/api/protected-resource', 'GET');
 * } catch (error) {
 *   if (isUnauthorizedError(error)) {
 *     // Redirect to login or show authentication error
 *     window.location.href = '/login';
 *   }
 * }
 * ```
 */
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}