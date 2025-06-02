import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { SendMoneyModal } from "@/components/send-money-modal";
import { TransactionItem } from "@/components/transaction-item";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, HandCoins, Plus, University, Wallet } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const balance = userProfile?.balance || "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hi {user?.firstName || 'there'}
          </h2>
          <p className="text-gray-600">Here's what's happening with your money.</p>
        </div>

        {/* Account Balance Card */}
        <div className="paypal-gradient rounded-xl p-6 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-2">PayPal balance</p>
              <h3 className="text-3xl font-bold mb-4">${balance}</h3>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowSendModal(true)}
                  className="bg-white paypal-blue hover:bg-gray-100"
                >
                  Send
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:paypal-blue"
                >
                  Request
                </Button>
              </div>
            </div>
            <div className="text-right">
              <Wallet className="text-2xl text-blue-200" size={32} />
            </div>
          </div>
        </div>




      </main>

      <MobileNav />
      
      {showSendModal && (
        <SendMoneyModal onClose={() => setShowSendModal(false)} />
      )}
    </div>
  );
}
