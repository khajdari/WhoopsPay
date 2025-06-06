/**
 * Layout Component - Main application layout wrapper
 * 
 * Provides consistent page structure with proper footer positioning.
 * Ensures minimum viewport height and dynamic content expansion.
 */
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
}

/**
 * Layout Component - Standard page layout
 * 
 * Features:
 * - Full viewport height layout with flex structure
 * - Header at top (optional)
 * - Main content area that expands to fill available space
 * - Footer at bottom with minimum height (optional)
 * - Mobile navigation (optional)
 */
export function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showMobileNav = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      
      {/* Main content area - grows to fill available space */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}
    </div>
  );
}