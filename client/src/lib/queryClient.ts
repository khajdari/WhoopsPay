/**
 * Query Client Configuration - Centralized API communication layer
 * 
 * Provides standardized HTTP request handling, error management, and
 * caching strategies for the WhoopsPay application. Includes session
 * management and authentication state handling.
 */
import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * HTTP Response Error Handler - Converts failed responses to errors
 * 
 * Extracts meaningful error messages from HTTP responses and throws
 * standardized errors for consistent error handling throughout the app.
 * 
 * @param res - HTTP Response object to validate
 * @throws Error with status code and response text
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * API Request Helper - Standardized HTTP request function
 * 
 * Handles all API communication with consistent headers, credentials,
 * and error handling. Automatically includes session cookies for
 * authentication and sets appropriate content types.
 * 
 * @param url - API endpoint URL
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param data - Optional request body data (will be JSON stringified)
 * @returns Promise resolving to Response object
 * @throws Error if request fails or returns error status
 */
export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const bodyString = data ? JSON.stringify(data) : undefined;
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: bodyString,
    credentials: "include", // Include session cookies for authentication
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Unauthorized behavior configuration for query functions
 * Controls how authentication failures are handled in API requests
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Query Function Factory - Creates configured query functions for TanStack Query
 * 
 * Generates query functions with customizable unauthorized error handling.
 * Used to standardize API data fetching across the application with
 * consistent authentication and error management.
 * 
 * @param options - Configuration object with unauthorized behavior setting
 * @returns QueryFunction configured for TanStack Query usage
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Include session cookies for authentication
    });

    // Handle unauthorized responses based on configuration
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Global Query Client - Centralized TanStack Query configuration
 * 
 * Configures default behavior for all queries and mutations in the application:
 * - Automatic error handling for failed requests
 * - Session-based authentication with credential inclusion
 * - Disabled automatic refetching for educational stability
 * - Infinite stale time to prevent unnecessary re-requests
 * - Disabled retries to show immediate error states for learning
 * 
 * Educational Note: In production, enable refetching and retries for better UX
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Throw on unauthorized for immediate error handling
      refetchInterval: false, // Disable automatic background refetching
      refetchOnWindowFocus: false, // Disable refetch on window focus for demo stability
      staleTime: Infinity, // Data never becomes stale for educational consistency
      retry: false, // No retries to show error states immediately
    },
    mutations: {
      retry: false, // No mutation retries for immediate error feedback
    },
  },
});
