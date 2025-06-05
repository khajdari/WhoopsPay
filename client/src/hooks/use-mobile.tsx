/**
 * Mobile Detection Hook - Responsive design utility
 * 
 * Provides mobile device detection functionality for responsive UI:
 * - Dynamic screen size monitoring with media queries
 * - Automatic updates on viewport size changes
 * - Configurable mobile breakpoint threshold
 * - Optimized for performance with proper cleanup
 * - SSR-safe with undefined initial state
 * 
 * Educational Security Features:
 * - Demonstrates proper event listener management
 * - Shows responsive design security considerations
 * - Includes client-side detection patterns
 * 
 * VULNERABILITY NOTE: Client-side detection may be spoofed
 * for educational security training purposes.
 */
import * as React from "react"

/**
 * Mobile Breakpoint Constant - Screen width threshold
 * 
 * Defines the pixel width below which devices are considered mobile.
 * Set to 768px to align with common responsive design standards.
 */
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook - Mobile device detection
 * 
 * Custom React hook that detects mobile devices based on screen width.
 * Features include:
 * - Real-time viewport monitoring with media queries
 * - Automatic state updates on window resize
 * - Proper event listener cleanup to prevent memory leaks
 * - SSR-compatible with undefined initial state
 * - Performance optimized with minimal re-renders
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
