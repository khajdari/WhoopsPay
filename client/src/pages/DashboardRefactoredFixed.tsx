import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Activity, 
  CreditCard, 
  Send, 
  Plus, 
  Eye, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Layout } from "@/components/layout";

export default function DashboardRefactoredFixed() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [showSendModal, setShowSendModal] = useState(false);
  
  // Fetch user profile data
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/auth/user"]
  });
  
  // Fetch user's detailed profile
  const { data: detailedProfile } = useQuery({
    queryKey: [`/api/users/${userProfile?.id}/profile`],
    enabled: !!userProfile?.id
  });
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions"]
  });
  
  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["/api/payments"]
  });
  
  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["/api/pending-requests"]
  });

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(num);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, className: "bg-green-600 text-white" },
      pending: { variant: "secondary" as const, className: "bg-yellow-600 text-white" },
      rejected: { variant: "destructive" as const, className: "bg-red-600 text-white" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="bg-black text-yellow-400 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p>{t("loading")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black text-yellow-400 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t("dashboardWelcome")}, {(detailedProfile as any)?.firstName || (userProfile as any)?.email || "User"}!
            </h1>
            <p className="text-gray-400">{t("dashboardSubtitle")}</p>
          </div>

          {/* Account Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t("dashboardBalance")}</p>
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
                    <p className="text-sm font-medium text-gray-400">{t("dashboardTransactions")}</p>
                    <p className="text-2xl font-bold text-yellow-400">{transactions.length || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t("dashboardPaymentMethods")}</p>
                    <p className="text-2xl font-bold text-yellow-400">{paymentMethods.length || 0}</p>
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
              {t("dashboardSendMoney")}
            </Button>

            <Button 
              onClick={() => navigate("/wallet")}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col"
            >
              <Plus className="h-6 w-6 mb-2" />
              {t("dashboardAddMoney")}
            </Button>

            <Button 
              onClick={() => navigate("/transactions")}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col"
            >
              <Eye className="h-6 w-6 mb-2" />
              {t("dashboardViewTransactions")}
            </Button>

            <Button 
              onClick={() => navigate("/profile")}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 h-20 w-full flex-col"
            >
              <Settings className="h-6 w-6 mb-2" />
              {t("dashboardSettings")}
            </Button>
          </div>

          {/* Pending Requests */}
          {pendingRequests && pendingRequests.length > 0 && (
            <Card className="bg-gray-900 border-yellow-400/30 mb-8">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t("dashboardPendingRequests")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 5).map((request: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-yellow-400/20 rounded-lg">
                      <div>
                        <p className="font-medium">Request from {request.fromUserId}</p>
                        <p className="text-sm text-gray-400">{formatAmount(request.amount)}</p>
                        {request.description && (
                          <p className="text-xs text-gray-500 mt-1">{request.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          {t("approve")}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                          {t("reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions and Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t("dashboardRecentTransactions")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                    <p>{t("loading")}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">{t("dashboardNoTransactions")}</p>
                    <Button
                      onClick={() => setShowSendModal(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      {t("dashboardSendFirstPayment")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction: Transaction, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-yellow-400/20 rounded">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium">
                              {transaction.type === 'transfer' ? 'Transfer' : transaction.type}
                            </p>
                            <p className="text-sm text-gray-400">
                              {transaction.fromUserId} → {transaction.toUserId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatAmount(transaction.amount)}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">{t("dashboardPaymentMethods")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPaymentMethods ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                    <p>{t("loading")}</p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">{t("dashboardNoPaymentMethods")}</p>
                    <Button
                      onClick={() => navigate("/wallet")}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      {t("dashboardAddPaymentMethod")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.slice(0, 3).map((method: PaymentMethod, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-yellow-400/20 rounded">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="font-medium capitalize">{method.type}</p>
                            <p className="text-sm text-gray-400">**** {method.lastFourDigits}</p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge className="bg-yellow-400 text-black">Default</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Send Money Modal */}
          {showSendModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md border border-yellow-400/30">
                <h2 className="text-xl font-bold text-yellow-400 mb-4">{t("transferTitle")}</h2>
                <p className="text-gray-400 mb-6">{t("transferSubtitle")}</p>
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setShowSendModal(false);
                      navigate("/send-money");
                    }}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    {t("continue")}
                  </Button>
                  <Button
                    onClick={() => setShowSendModal(false)}
                    variant="outline"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}