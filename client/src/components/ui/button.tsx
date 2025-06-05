/**
 * Button Component - Customizable interactive button UI element
 * 
 * Comprehensive button component providing:
 * - Multiple visual variants (default, destructive, outline, secondary, ghost, link)
 * - Flexible sizing options (default, small, large, icon)
 * - Full accessibility support with focus management
 * - Polymorphic component support with asChild prop
 * - Consistent styling with design system integration
 * 
 * Educational Security Features:
 * - Demonstrates proper component accessibility patterns
 * - Shows secure event handling and state management
 * - Includes focus management for keyboard navigation
 * 
 * Built on Radix UI primitives for maximum accessibility and customization.
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Variants Configuration - Style and size definitions
 * 
 * Uses class-variance-authority for type-safe variant management.
 * Provides consistent styling across all button instances.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * ButtonProps Interface - Button component properties
 * 
 * Extends HTML button attributes with custom variant props and polymorphic support.
 * Provides full TypeScript integration for better developer experience.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button Component - Main button implementation
 * 
 * Forwardable ref component supporting all standard button functionality
 * with enhanced styling and accessibility features.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
