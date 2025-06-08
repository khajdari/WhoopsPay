import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  CreditCard, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUpDown,
  Settings,
  Eye,
  EyeOff,
  DollarSign,
  Building2,
  Star,
  AlertTriangle,
  Clock
} from "lucide-react";
import { WalletController, type WalletBalance, type AddPaymentMethodData } from "../../controllers/WalletController";
import { PaymentMethodModel } from "../../models/PaymentMethodModel";
import { useAuth } from "../../hooks/useAuth";
import { PaymentMethodCard } from "../../components/business/PaymentMethodCard";
import { AddCardForm } from "../../components/forms/AddCardForm";

interface WalletViewProps {
  userId?: string;
  showBalanceControls?: boolean;
  showAddPaymentMethod?: boolean;
}

export function WalletView({
  userId,
  showBalanceControls = true,
  showAddPaymentMethod = true
}: WalletViewProps) {
  const { user } = useAuth();
  const currentUserId = userId || user?.id;
  
  const [controller] = useState(() => new WalletController());
  
  // State management
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodModel[]>([]);
  const [walletStats, setWalletStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAddCard, setShowAddCard] = useState(false);

  // Load wallet data
  const loadWalletData = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      const [balanceResult, methodsResult, statsResult] = await Promise.all([
        controller.getWalletBalance(currentUserId),
        controller.getPaymentMethods(currentUserId),
        controller.getWalletStats(currentUserId)
      ]);

      if (balanceResult.success) {
        setBalance(balanceResult.data as WalletBalance);
      }

      if (methodsResult.success) {
        setPaymentMethods(methodsResult.data as PaymentMethodModel[]);
      }

      if (statsResult.success) {
        setWalletStats(statsResult.data);
      }

      if (!balanceResult.success || !methodsResult.success) {
        setError('Failed to load wallet data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add payment method
  const handleAddPaymentMethod = async (data: any) => {
    if (!currentUserId) return;

    try {
      const addData: AddPaymentMethodData = {
        type: 'card',
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        holderName: data.holderName
      };

      const result = await controller.addPaymentMethod(currentUserId, addData);

      if (result.success) {
        setShowAddCard(false);
        loadWalletData(); // Refresh data
      } else {
        setError(result.error || 'Failed to add payment method');
      }
    } catch (err) {
      setError('Failed to add payment method');
    }
  };

  // Set default payment method
  const handleSetDefault = async (methodId: number) => {
    if (!currentUserId) return;

    try {
      const result = await controller.setDefaultPaymentMethod(currentUserId, methodId);
      
      if (result.success) {
        loadWalletData(); // Refresh data
      } else {
        setError(result.error || 'Failed to set default payment method');
      }
    } catch (err) {
      setError('Failed to update payment method');
    }
  };

  // Remove payment method
  const handleRemoveMethod = async (methodId: number) => {
    if (!currentUserId) return;

    try {
      const result = await controller.removePaymentMethod(currentUserId, methodId);
      
      if (result.success) {
        loadWalletData(); // Refresh data
      } else {
        setError(result.error || 'Failed to remove payment method');
      }
    } catch (err) {
      setError('Failed to remove payment method');
    }
  };

  // Effects
  useEffect(() => {
    loadWalletData();
  }, [currentUserId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 text-gray-400">
            <Wallet className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Loading Wallet</h3>
            <p>Please wait while we load your wallet information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-red-900/20 border-red-400/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Wallet</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button
                onClick={loadWalletData}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate wallet statistics
  const totalMethods = paymentMethods.length;
  const activeMethods = paymentMethods.filter(m => !m.isExpired()).length;
  const expiringMethods = paymentMethods.filter(m => m.isExpiringSoon()).length;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center">
              <Wallet className="w-8 h-8 mr-3" />
              My Wallet
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your balance and payment methods
            </p>
          </div>
          
          {showAddPaymentMethod && (
            <Button
              onClick={() => setShowAddCard(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          )}
        </div>

        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-80">Total Balance</span>
                  {showBalanceControls && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 h-auto text-black hover:bg-black/10"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
                
                <div className="text-3xl font-bold mb-1">
                  {showBalance ? (balance ? `$${balance.current.toFixed(2)}` : '$0.00') : '••••••'}
                </div>
                
                <div className="text-sm opacity-80">
                  Available: {showBalance ? (balance ? `$${balance.available.toFixed(2)}` : '$0.00') : '••••••'}
                  {balance && balance.pending > 0 && (
                    <span className="ml-3">
                      Pending: {showBalance ? `$${balance.pending.toFixed(2)}` : '••••••'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  <span>{totalMethods} Payment Methods</span>
                </div>
                
                {expiringMethods > 0 && (
                  <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                    {expiringMethods} Expiring Soon
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Methods</p>
                  <p className="text-2xl font-bold text-white">{totalMethods}</p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Methods</p>
                  <p className="text-2xl font-bold text-green-400">{activeMethods}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-400">{expiringMethods}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payment Methods */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Recent Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No payment methods added</p>
                      <Button
                        onClick={() => setShowAddCard(true)}
                        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Add Your First Payment Method
                      </Button>
                    </div>
                  ) : (
                    paymentMethods.slice(0, 3).map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method as any}
                        onDelete={handleRemoveMethod}
                        onSetDefault={handleSetDefault}
                        compact={true}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Wallet Statistics */}
              {walletStats && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Wallet Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Total Transactions</p>
                        <p className="text-xl font-bold text-white">{walletStats.totalTransactions}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Spending</p>
                        <p className="text-xl font-bold text-white">${walletStats.monthlySpending?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    
                    {walletStats.topCategories && walletStats.topCategories.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Top Categories</p>
                        <div className="space-y-2">
                          {walletStats.topCategories.slice(0, 3).map((category: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-300">{category.category}</span>
                              <span className="text-white">${category.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
              <Button
                onClick={() => setShowAddCard(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>

            {paymentMethods.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium text-white mb-2">No Payment Methods</h3>
                  <p className="text-gray-400 mb-6">Add a payment method to start making transactions</p>
                  <Button
                    onClick={() => setShowAddCard(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method as any}
                    onDelete={handleRemoveMethod}
                    onSetDefault={handleSetDefault}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {walletStats?.recentActivity && walletStats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {walletStats.recentActivity.map((transaction: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                        <div>
                          <p className="text-white font-medium">{transaction.description || 'Transaction'}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">${transaction.amount.toFixed(2)}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              transaction.status === 'completed' ? 'text-green-400 border-green-400' :
                              transaction.status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                              'text-red-400 border-red-400'
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Payment Method Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
              <AddCardForm
                onSubmit={handleAddPaymentMethod}
                onCancel={() => setShowAddCard(false)}
                isLoading={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}