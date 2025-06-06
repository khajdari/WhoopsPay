/**
 * Dashboard Page - Main user interface for WhoopsPay
 * 
 * Central hub displaying user financial overview, recent transactions,
 * payment methods, and quick action buttons. Provides comprehensive
 * financial management interface with real-time data updates.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { SendMoneyModal } from "@/components/send-money-modal";
import { TransactionItem } from "@/components/transaction-item";
import { PaymentCard } from "@/components/payment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, HandCoins, Plus, University, Wallet, CreditCard, Users, Shield, Activity, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

/**
 * Dashboard Component - Main authenticated user landing page
 * 
 * Features:
 * - Account balance and financial overview
 * - Recent transaction history with visual indicators
 * - Payment method management with interactive cards
 * - Quick action buttons for common operations
 * - Security status indicators and admin access
 * - Responsive design with mobile navigation
 */
export default function Dashboard() {
  const { user } = useAuth(); // Current authenticated user data
  const { t } = useI18n(); // Translation system
  const [showSendModal, setShowSendModal] = useState(false); // Send money modal state

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payments", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/payments?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  // Admin-specific data
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user as any)?.isAdmin === 1,
  });

  const { data: allTransactions, isLoading: allTransactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    enabled: !!user && (user as any)?.isAdmin === 1,
  });

  const { data: systemLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
    enabled: !!user && (user as any)?.isAdmin === 1,
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
  const isAdmin = (user as any)?.isAdmin === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        {/* Welcome Section with Send/Request Buttons */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isAdmin ? `Admin Dashboard - Hi ${(user as any)?.firstName || 'Admin'}` : `Hi ${(user as any)?.firstName || 'there'}`}
            </h2>
            <p className="text-gray-600">
              {isAdmin ? "Manage users, transactions, and system security." : "Here's what's happening with your money."}
            </p>
          </div>
          {!isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/transfer?mode=send'}
                className="paypal-btn-base paypal-btn-primary paypal-btn-sm"
              >
                {t('sendMoney')}
              </button>
              <button
                onClick={() => window.location.href = '/transfer?mode=request'}
                className="paypal-btn-base paypal-btn-secondary paypal-btn-sm"
              >
                {t('requestMoney')}
              </button>
            </div>
          )}
        </div>

        {/* WhoopsPay Balance Card */}
        <div className="whoopspay-gradient rounded-xl p-6 text-white mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-2">{t('balance')}</p>
              <h3 className="text-3xl font-bold">${balance}</h3>
            </div>
            <div className="text-right">
              <Wallet className="text-2xl text-blue-200" size={32} />
            </div>
          </div>
        </div>

        {isAdmin ? (
          /* Admin Dashboard Content */
          <>
            {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usersLoading ? <Skeleton className="h-8 w-16" /> : allUsers ? allUsers.length : '0'}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">All Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allTransactionsLoading ? <Skeleton className="h-8 w-16" /> : allTransactions ? allTransactions.length : '0'}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Security Issues</p>
                    <p className="text-2xl font-bold text-red-600">
                      {logsLoading ? <Skeleton className="h-8 w-16" /> : '7'}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </Card>
            </div>

            {/* Admin Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* All Users */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                </div>
                <div className="p-6">
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : allUsers && allUsers.length > 0 ? (
                    <div className="space-y-4">
                      {allUsers.slice(0, 5).map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {user.firstName?.charAt(0) || user.id.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.id}
                              </p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No users found</p>
                  )}
                </div>
              </Card>

              {/* All Transactions */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {allTransactionsLoading ? (
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
                  ) : allTransactions && allTransactions.length > 0 ? (
                    allTransactions.slice(0, 5).map((transaction: any) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <p>No transactions found</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        ) : (
          /* Regular User Dashboard Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <Link href="/transactions">
                      <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0">
                        See all
                      </Button>
                    </Link>
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
        )}
      </main>

      <MobileNav />
      
      {showSendModal && (
        <SendMoneyModal onClose={() => setShowSendModal(false)} />
      )}
    </div>
  );
}
