import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { SendMoneyModal } from "@/components/send-money-modal";
import { TransactionItem } from "@/components/transaction-item";
import { PaymentCard } from "@/components/payment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, HandCoins, Plus, University, Wallet, CreditCard } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payment-methods", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/payment-methods?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
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

  const balance = (userProfile as any)?.balance || "0.00";

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

        {/* PayPwned Balance Card */}
        <div className="paypwned-gradient rounded-xl p-6 text-white mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-2">PayPwned balance</p>
              <h3 className="text-3xl font-bold">${balance}</h3>
            </div>
            <div className="text-right">
              <Wallet className="text-2xl text-blue-200" size={32} />
            </div>
          </div>
        </div>

        {/* Send/Request Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => window.location.href = '/send'}
            className="paypal-btn-base paypal-btn-primary paypal-btn-sm"
          >
            Send
          </button>
          <button
            onClick={() => window.location.href = '/send'}
            className="paypal-btn-base paypal-btn-secondary paypal-btn-sm"
          >
            Request
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0">
                    See all
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {transactionsLoading ? (
                  <div className="space-y-4 p-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(transactions) && transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction: any) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <p>No transactions yet</p>
                    <p className="text-sm">Send or request money to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {paymentMethodsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method: any) => (
                      <PaymentCard
                        key={method.id}
                        type={method.type}
                        cardNumber={method.cardNumber}
                        cardName={method.cardName}
                        bankName={method.bankName}
                        accountNumber={method.accountNumber}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">No payment methods added</p>
                    <p className="text-xs text-gray-500 mt-2">Manage payment methods in your Wallet</p>
                  </div>
                )}
              </div>
            </Card>
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
