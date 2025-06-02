import { Home, Send, List, Wallet as WalletIcon, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export function MobileNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home, current: location === "/" },
    { name: "Send", href: "/send", icon: Send, current: location === "/send" },
    { name: "Activity", href: "/transactions", icon: List, current: location === "/transactions" },
    { name: "Wallet", href: "/wallet", icon: WalletIcon, current: location === "/wallet" },
    { name: "Account", href: "/account", icon: User, current: location === "/account" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={`flex flex-col items-center justify-center h-full transition-colors ${
                  item.current
                    ? "paypal-blue"
                    : "text-gray-500 hover:paypal-blue"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
