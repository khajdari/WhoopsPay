/**
 * Header Component - Main navigation and user interface bar
 * 
 * Provides top-level navigation, user account management, notifications,
 * and authentication controls. Displays user information and quick access
 * to key application features with responsive design.
 */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationsModal } from "@/components/notifications-modal";
import { LanguageSelector } from "@/components/language-selector";
import { Bell, ChevronDown, Menu, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";

/**
 * Header Component - Application navigation and user controls
 * 
 * Features:
 * - User authentication status display with avatar
 * - Notification bell with unread count badge
 * - User dropdown menu with profile and settings
 * - Admin panel access for privileged users
 * - Logout functionality with session termination
 * - Responsive layout with mobile considerations
 * - Current location awareness for navigation highlighting
 */
export function Header() {
  const { user, logout, isAuthenticated } = useAuth(); // Authentication state and controls
  const { unreadCount, markAllAsRead, clearAll } = useNotifications(); // Notification management
  const { t } = useI18n(); // Translation system
  const [location, navigate] = useLocation(); // Current page location and navigation
  const [showNotifications, setShowNotifications] = useState(false); // Notification modal state

  /**
   * Handle user logout - Terminates session and redirects
   */
  const handleLogout = () => {
    logout();
  };

  const navigation = user?.isAdmin ? [
    { name: t('dashboard'), href: "/dashboard", current: location === "/" || location === "/dashboard" },
    { name: "Administration", href: "/administration", current: location === "/administration" },
    { name: t('issueReports'), href: "/issues", current: location === "/issues" },
  ] : [
    { name: t('dashboard'), href: "/dashboard", current: location === "/" || location === "/dashboard" },
    { name: t('sendMoney'), href: "/transfer", current: location === "/transfer" },
    { name: t('transactions'), href: "/transactions", current: location === "/transactions" },
    { name: t('wallet'), href: "/money", current: location === "/money" },
    { name: t('issueReports'), href: "/issues", current: location === "/issues" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold whoopspay-blue">
                  WhoopsPay
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    item.current
                      ? "whoopspay-blue border-b-2 border-blue-600"
                      : "text-gray-700 hover:whoopspay-blue"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-5 w-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="w-full cursor-pointer">
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout}>
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <NotificationsModal 
        open={showNotifications} 
        onOpenChange={setShowNotifications}
        onMarkAllRead={markAllAsRead}
        onClearAll={clearAll}
      />
    </header>
  );
}
