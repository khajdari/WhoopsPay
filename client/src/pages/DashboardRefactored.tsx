import { useState } from "react";
import { Link } from "wouter";
import { useDashboard } from "@/hooks/useDashboard";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/layout";
import { SendMoneyModal } from "@/components/send-money-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  HandCoins, 
  Plus, 
  University, 
  Wallet, 
  CreditCard, 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  ExternalLink 
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import PaymentCard from "@/components/common/PaymentCard";
import PaymentList from "@/components/common/PaymentList";

export default function DashboardRefactored() {
  const { t } = useI18n();
  const [showSendModal, setShowSendModal] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<number | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<number | null>(null);

  const {
    user,
    userProfile,
    transactions,
    pendingRequests,
    paymentMethods,
    systemHealth,
    allUsers,
    allTransactions,
    isLoading,
    healthLoading,
    usersLoading,
    adminTransactionsLoading,
    approveRequest,
    rejectRequest,
    isApprovingRequest,
    isRejectingRequest,
    isAdmin,
    formatAmount,
    formatStatus,
    getStatusColor,
  } = useDashboard();

  const handleApproveRequest = async (requestId: number) => {
    setApprovingRequest(requestId);
    try {
      await approveRequest(requestId);
    } finally {
      setApprovingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setRejectingRequest(requestId);
    try {
      await rejectRequest(requestId);
    } finally {
      setRejectingRequest(null);
    }
  };

  // Admin Dashboard View
  if (isAdmin) {
    return (
      <Layout>
        <div className="bg-black text-yellow-400 min-h-screen">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">System Health Dashboard</h1>
              <p className="text-gray-400">Monitor application health and system status</p>
            </div>

            {/* Health Check Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Database</p>
                      <p className="text-2xl font-bold text-green-400">Online</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">API Status</p>
                      <p className="text-2xl font-bold text-green-400">Healthy</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {usersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : allUsers.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">System Failures</p>
                      <p className="text-2xl font-bold text-green-400">0</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-yellow-400/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  {healthLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Server Started:</span>
                        <span className="text-white">
                          {systemHealth?.startTime 
                            ? new Date(systemHealth.startTime).toLocaleString()
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">Online</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {adminTransactionsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Transactions:</span>
                        <span className="text-white">{allTransactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Users:</span>
                        <span className="text-white">{allUsers.length}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <div className="mt-8 flex gap-4">
              <Link href="/administration">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Shield className="w-4 h-4 mr-2" />
                  Full Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Regular User Dashboard View
  return (
    <Layout>
      <div className="bg-black text-yellow-400 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t("dashboard.welcome")}, {userProfile?.firstName || user?.email || "User"}!
            </h1>
            <p className="text-gray-400">{t("dashboard.subtitle")}</p>
          </div>

          {/* Account Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t("dashboard.balance")}</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatAmount(userProfile?.balance || "0")}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t("dashboard.transactions")}</p>
                    <p className="text-2xl font-bold text-yellow-400">{transactions.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t("dashboard.paymentMethods")}</p>
                    <p className="text-2xl font-bold text-yellow-400">{paymentMethods.length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button 
              onClick={() => setShowSendModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black h-20 flex-col"
            >
              <Send className="h-6 w-6 mb-2" />
              {t("dashboard.sendMoney")}
            </Button>

            <Link href="/money">
              <Button className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col">
                <Plus className="h-6 w-6 mb-2" />
                {t("dashboard.addMoney")}
              </Button>
            </Link>

            <Link href="/transactions">
              <Button className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col">
                <HandCoins className="h-6 w-6 mb-2" />
                {t("dashboard.viewTransactions")}
              </Button>
            </Link>

            <Link href="/account">
              <Button className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col">
                <University className="h-6 w-6 mb-2" />
                {t("dashboard.settings")}
              </Button>
            </Link>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="bg-gray-900 border-yellow-400/30 mb-8">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {t("dashboard.pendingRequests")} ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentList
                  payments={pendingRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  approvingId={approvingRequest}
                  rejectingId={rejectingRequest}
                  showActions
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t("dashboard.recentTransactions")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner />
                ) : transactions.length === 0 ? (
                  <EmptyState 
                    message={t("dashboard.noTransactions")}
                    action={
                      <Button onClick={() => setShowSendModal(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        {t("dashboard.sendFirstPayment")}
                      </Button>
                    }
                  />
                ) : (
                  <PaymentList payments={transactions.slice(0, 5)} />
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t("dashboard.paymentMethods")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner />
                ) : paymentMethods.length === 0 ? (
                  <EmptyState 
                    message={t("dashboard.noPaymentMethods")}
                    action={
                      <Link href="/money">
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                          {t("dashboard.addPaymentMethod")}
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.slice(0, 3).map((method) => (
                      <PaymentCard key={method.id} method={method} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Send Money Modal */}
        <SendMoneyModal 
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      </div>
    </Layout>
  );
}