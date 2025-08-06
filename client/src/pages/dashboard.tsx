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
import { Layout } from "@/components/layout";
import { SendMoneyModal } from "@/components/send-money-modal";
import { TransactionItem } from "@/components/transaction-item";
import { PaymentCard } from "@/components/payment-card";
import { PaymentRequestList } from "@/components/business/PaymentRequestList";
import MoneyRequestModal from "@/components/modals/MoneyRequestModal";
import { RedirectModal } from "@/components/modals/RedirectModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, HandCoins, Plus, University, Wallet, CreditCard, Users, Shield, Activity, AlertTriangle, Clock, Check, X, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast(); // Toast notifications
  const [showSendModal, setShowSendModal] = useState(false); // Send money modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectData, setRedirectData] = useState<any>(null);

  // Server status data for admin dashboard
  const { data: serverStatus } = useQuery({
    queryKey: ["/api/admin/server-status"],
    enabled: !!user && (user as any)?.isAdmin === 1,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // System Failures Count Component
  const SystemFailuresCount = () => {
    const { data: expressLogs } = useQuery({
      queryKey: ["/api/admin/logs/express"],
      refetchInterval: 30000, // Refetch every 30 seconds
    });

    const errorCount = expressLogs?.logs ? 
      expressLogs.logs.filter((log: string) => 
        log.includes(' 4') || log.includes(' 5') || log.toLowerCase().includes('error')
      ).length : 0;

    return (
      <p className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
        {errorCount}
      </p>
    );
  };

  // If admin, show only health check information
  if (user?.isAdmin) {
    return (
      <Layout>
        <div className="bg-gray-50 dark:bg-gray-900 flex-1">
        
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Health Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor application health and system status
            </p>
          </div>

          {/* Health Check Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Database</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Server</p>
                    {serverStatus ? (
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-green-600">
                          Started: {new Date(serverStatus.startTime).toLocaleString()}
                        </p>
                        <span className="text-xs text-gray-500">(4 services running)</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">Running</p>
                    )}
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">4</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Failures</p>
                    <SystemFailuresCount />
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Administration</h3>
                <Link href="/administration">
                  <Button className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Issue Reports</h3>
                <Link href="/issues">
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Monitor Issues
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </Layout>
    );
  }

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

  // Pending requests data for regular users
  const { data: pendingRequests, isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ["/api/pending-requests", user?.id],
    enabled: !!user && (user as any)?.isAdmin !== 1,
  });

  const { data: systemLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
    enabled: !!user && (user as any)?.isAdmin === 1,
  });

  // Handle opening request modal for review
  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleExternalRedirect = (redirectUrl: string, isApproval: boolean, orderInfo: any) => {
    setRedirectData({
      redirectUrl,
      isApproval,
      orderInfo
    });
    setShowRedirectModal(true);
  };

  const handleCloseRequestModal = () => {
    setSelectedRequest(null);
    setShowRequestModal(false);
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="bg-gray-50 flex-1">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const balance = (userProfile as any)?.balance || "0.00";
  const isAdmin = (user as any)?.isAdmin === 1;

  return (
    <Layout>
      <div className="bg-gray-50 flex-1">
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        {/* Welcome Section with Send/Request Buttons */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isAdmin ? `${t('admin.title')} - ${t('hi')} ${(user as any)?.firstName || 'Admin'}` : `${t('hi')} ${(user as any)?.firstName || 'there'}`}
            </h2>
            <p className="text-gray-600">
              {isAdmin ? t('admin.userManagement') : t('dashboard.subtitle')}
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
              <h3 className="text-3xl font-bold">¤{balance}</h3>
            </div>
            <div className="text-right">
              <Wallet className="text-2xl text-blue-200" size={32} />
            </div>
          </div>
        </div>

        {/* Pending Requests Dropdown - Only for regular users */}
        {!isAdmin && (
          <div className="mb-6">
            <Card>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    {t('dashboard.pendingRequests')}
                    {pendingRequests && pendingRequests.length > 0 && (
                      <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {pendingRequests.length}
                      </span>
                    )}
                  </h3>
                </div>
                
                {pendingRequestsLoading ? (
                  <div className="mt-4 space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(pendingRequests) && pendingRequests.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {pendingRequests.map((request: any) => (
                      <div 
                        key={request.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                          request.type === 'external' 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                        }`}
                        onClick={() => handleRequestClick(request)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            request.type === 'external' 
                              ? 'bg-blue-100' 
                              : 'bg-orange-100'
                          }`}>
                            {request.type === 'external' ? (
                              <ExternalLink className="w-5 h-5 text-blue-600" />
                            ) : (
                              <span className="text-orange-600 font-medium">
                                {request.fromUser?.firstName?.charAt(0) || request.fromUserId.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                ¤{request.amount} from {request.fromUser?.firstName} {request.fromUser?.lastName}
                              </p>
                              {request.type === 'external' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  External
                                </span>
                              )}
                              {request.type === 'internal' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Internal
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{request.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                              {request.externalOrderId && (
                                <span className="ml-2">• Order #{request.externalOrderId}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <span className="text-sm">Click to review</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>{t('noPendingRequests')}</p>
                    <p className="text-sm">{t('noPendingRequestsDesc')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

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
                    <p className="text-sm font-medium text-gray-600">API Server</p>
                    <div className="flex flex-col">
                      {serverStatus ? (
                        <>
                          <p className="text-sm font-medium text-green-600">
                            Started: {new Date(serverStatus.startTime).toLocaleString()}
                          </p>
                          <span className="text-xs text-gray-500">({allUsers ? '4' : '0'} services running)</span>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-green-600">Running</p>
                      )}
                    </div>
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
                  <h3 className="text-lg font-medium text-gray-900">{t('recentTransactions')}</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">{t('recentActivity')}</h3>
                    <Link href="/transactions">
                      <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0">
                        {t('seeAll')}
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{t('paymentMethods')}</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {paymentMethodsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full rounded-xl" />
                      <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                  ) : paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method: any) => (
                        <div key={method.id} className="h-[172px] flex items-center justify-center">
                          <PaymentCard
                            type={method.type}
                            cardNumber={method.cardNumber}
                            cardName={method.cardName}
                            bankName={method.bankName}
                            accountNumber={method.accountNumber}
                          />
                        </div>
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
      
      {showSendModal && (
        <SendMoneyModal onClose={() => setShowSendModal(false)} />
      )}
      
      {selectedRequest && (
        <MoneyRequestModal 
          request={selectedRequest}
          isOpen={showRequestModal}
          onClose={handleCloseRequestModal}
          onExternalRedirect={handleExternalRedirect}
        />
      )}
      
      {redirectData && (
        <RedirectModal
          isOpen={showRedirectModal}
          onClose={() => {
            setShowRedirectModal(false);
            setRedirectData(null);
          }}
          redirectUrl={redirectData.redirectUrl}
          isApproval={redirectData.isApproval}
          orderInfo={redirectData.orderInfo}
        />
      )}
      
      </div>
    </Layout>
  );
}
