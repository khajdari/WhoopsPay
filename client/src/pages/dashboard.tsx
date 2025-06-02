import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { SendMoneyModal } from "@/components/send-money-modal";
import { AddCardModal } from "@/components/add-card-modal";
import { AddBankModal } from "@/components/add-bank-modal";
import { TransactionItem } from "@/components/transaction-item";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, HandCoins, Plus, University, Wallet, CreditCard } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                ) : transactions && transactions.length > 0 ? (
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

          {/* Payment Methods Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Add a payment method to make transactions easier</p>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-paypal-blue text-white"
                      onClick={() => setShowAddCardModal(true)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowAddBankModal(true)}
                    >
                      <University className="w-4 h-4 mr-2" />
                      Add Bank Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
      
      {showSendModal && (
        <SendMoneyModal onClose={() => setShowSendModal(false)} />
      )}
      {showAddCardModal && (
        <AddCardModal onClose={() => setShowAddCardModal(false)} />
      )}
      {showAddBankModal && (
        <AddBankModal onClose={() => setShowAddBankModal(false)} />
      )}
    </div>
  );
}
