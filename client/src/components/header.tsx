import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationsModal } from "@/components/notifications-modal";
import { Bell, ChevronDown, Menu, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount, notifications, markAllAsRead, clearAll } = useNotifications();

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    { name: "Summary", href: "/summary", current: location === "/" || location === "/summary" },
    { name: "Transfer", href: "/transfer", current: location === "/transfer" },
    { name: "Transactions", href: "/transactions", current: location === "/transactions" },
    { name: "Money", href: "/money", current: location === "/money" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/summary">
              <div className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold paypwned-blue">
                  PayPwned
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
                      ? "paypwned-blue border-b-2 border-paypwned-blue"
                      : "text-gray-700 hover:paypwned-blue"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
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
                  <button 
                    onClick={() => window.location.href = '/profile'}
                    className="w-full text-left cursor-pointer"
                  >
                    Profile
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button 
                    onClick={() => window.location.href = '/account'}
                    className="w-full text-left cursor-pointer"
                  >
                    Account
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout}>
                  Log Out
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
        notifications={notifications}
        markAllAsRead={markAllAsRead}
        clearAll={clearAll}
        unreadCount={unreadCount}
      />
    </header>
  );
}
