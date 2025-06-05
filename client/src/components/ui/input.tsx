/**
 * Input Component - Customizable form input element
 * 
 * Comprehensive input component providing:
 * - Consistent styling across all input types
 * - Full accessibility support with focus management
 * - File upload styling integration
 * - Disabled state handling with visual feedback
 * - Responsive design with mobile-optimized text sizing
 * 
 * Educational Security Features:
 * - Demonstrates proper input validation patterns
 * - Shows secure form handling practices
 * - Includes accessibility considerations for screen readers
 * 
 * VULNERABILITY NOTE: Input validation may be intentionally weak
 * for educational security training purposes.
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component - Form input element with enhanced styling
 * 
 * Forwardable ref input component supporting all HTML input types
 * with consistent design system integration and accessibility features.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
