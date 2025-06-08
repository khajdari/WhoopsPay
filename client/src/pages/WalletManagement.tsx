import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  DollarSign
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { WalletService, type PaymentMethod, type WalletBalance } from "../services/WalletService";
import { PaymentMethodCard } from "../components/business/PaymentMethodCard";
import { AddCardForm } from "../components/forms/AddCardForm";
import { SendMoneyModal } from "../components/modals/SendMoneyModal";
import { useToast } from "../hooks/use-toast";

export default function WalletManagement() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showBalance, setShowBalance] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Queries
  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ["/api/payments", user?.id],
    enabled: !!user?.id
  });

  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/wallet", user?.id, "balance"],
    enabled: !!user?.id
  });

  // Mutations
  const addCardMutation = useMutation({
    mutationFn: WalletService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setShowAddCard(false);
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    }
  });

  const deleteMethodMutation = useMutation({
    mutationFn: WalletService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive",
      });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: WalletService.setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update default payment method",
        variant: "destructive",
      });
    }
  });

  const handleAddCard = (cardData: any) => {
    addCardMutation.mutate(cardData);
  };

  const handleDeleteMethod = (id: number) => {
    deleteMethodMutation.mutate(id);
  };

  const handleSetDefault = (id: number) => {
    setDefaultMutation.mutate(id);
  };

  const balance = walletBalance as WalletBalance;
  const methods = paymentMethods as PaymentMethod[];

  // Calculate wallet statistics
  const totalMethods = methods.length;
  const activeMethods = methods.filter(m => !WalletService.isExpired(m)).length;
  const expiringMethods = methods.filter(m => WalletService.getExpiryStatus(m) === 'expiring').length;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center">
              <Wallet className="w-8 h-8 mr-3" />
              Wallet Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your payment methods and wallet balance
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSendMoney(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Send Money
            </Button>
            
            <Button
              onClick={() => setShowAddCard(true)}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-80">Total Balance</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 h-auto text-black hover:bg-black/10"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="text-3xl font-bold mb-1">
                  {balanceLoading ? "Loading..." : 
                   showBalance ? WalletService.formatCurrency(balance?.current || 0) : "••••••"}
                </div>
                
                <div className="text-sm opacity-80">
                  Available: {showBalance ? WalletService.formatCurrency(balance?.available || 0) : "••••••"}
                  {balance?.pending > 0 && (
                    <span className="ml-3">
                      Pending: {showBalance ? WalletService.formatCurrency(balance.pending) : "••••••"}
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
            <TabsTrigger value="settings" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Settings
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
                  {methodsLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                  ) : methods.length === 0 ? (
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
                    methods.slice(0, 3).map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        onDelete={handleDeleteMethod}
                        onSetDefault={handleSetDefault}
                        compact={true}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowSendMoney(true)}
                    className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-3" />
                    Send Money
                  </Button>
                  
                  <Button
                    onClick={() => setShowAddCard(true)}
                    className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Add Payment Method
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedTab("settings")}
                    className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Wallet Settings
                  </Button>
                </CardContent>
              </Card>
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

            {methodsLoading ? (
              <div className="text-center py-12 text-gray-400">Loading payment methods...</div>
            ) : methods.length === 0 ? (
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
                {methods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onDelete={handleDeleteMethod}
                    onSetDefault={handleSetDefault}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Wallet Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Security</h3>
                  <p className="text-gray-400 mb-4">Manage your wallet security settings</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Show Balance</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className={showBalance ? "bg-yellow-400 text-black border-yellow-400" : ""}
                    >
                      {showBalance ? "Visible" : "Hidden"}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Notifications</h3>
                  <p className="text-gray-400 mb-4">Configure wallet-related notifications</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Transaction Alerts</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Low Balance Warnings</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Card Expiry Reminders</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="bg-gray-900 border-yellow-400/30">
          <AddCardForm
            onSubmit={handleAddCard}
            onCancel={() => setShowAddCard(false)}
            isLoading={addCardMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <SendMoneyModal
        isOpen={showSendMoney}
        onClose={() => setShowSendMoney(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        }}
      />
    </div>
  );
}