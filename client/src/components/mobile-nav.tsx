/**
 * Mobile Navigation Component - Bottom tab navigation for mobile devices
 * 
 * Provides mobile-optimized navigation with fixed bottom positioning:
 * - Five-tab layout with summary, transfer, transactions, money, and account
 * - Icon-based navigation with text labels
 * - Current location highlighting and visual feedback
 * - Responsive design optimized for touch interaction
 * - PayPal-style blue theming for active states
 * 
 * Educational Security Features:
 * - Demonstrates mobile navigation patterns
 * - Shows proper touch target sizing
 * - Includes accessible navigation structure
 * 
 * VULNERABILITY NOTE: Navigation state may expose user session
 * information for educational security training purposes.
 */
import { Home, Send, List, Wallet as WalletIcon, User } from "lucide-react";
import { Link, useLocation } from "wouter";

/**
 * MobileNav Component - Touch-optimized mobile navigation
 * 
 * Component that provides bottom tab navigation for mobile devices.
 * Features include:
 * - Fixed bottom positioning for easy thumb access
 * - Five-tab grid layout with equal spacing
 * - Current location detection and highlighting
 * - Icon and text label combinations
 * - PayPal-inspired color theming
 */
export function MobileNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: location === "/" || location === "/dashboard" },
    { name: "Transfer", href: "/transfer", icon: Send, current: location === "/transfer" },
    { name: "Transactions", href: "/transactions", icon: List, current: location === "/transactions" },
    { name: "Money", href: "/money", icon: WalletIcon, current: location === "/money" },
    { name: "Account", href: "/account", icon: User, current: location === "/account" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                  item.current
                    ? "paypal-blue"
                    : "text-gray-500 hover:paypal-blue"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
