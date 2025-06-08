import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Bell,
  Settings,
  Plus,
  Eye
} from "lucide-react";
import { AdminController } from "../../controllers/AdminController";
import { WalletController } from "../../controllers/WalletController";
import { TransactionController } from "../../controllers/TransactionController";
import { useAuth } from "../../hooks/useAuth";

interface DashboardViewProps {
  userRole?: 'user' | 'admin';
  showQuickActions?: boolean;
}

export function DashboardView({ 
  userRole = 'user',
  showQuickActions = true 
}: DashboardViewProps) {
  const { user } = useAuth();
  
  const [adminController] = useState(() => new AdminController());
  const [walletController] = useState(() => new WalletController());
  const [transactionController] = useState(() => new TransactionController());
  
  // State management
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      if (userRole === 'admin') {
        // Load admin dashboard
        const statsResult = await adminController.getDashboardStats();
        if (statsResult.success) {
          setDashboardStats(statsResult.data);
        }
      } else {
        // Load user dashboard
        const [balanceResult, transactionsResult, walletStatsResult] = await Promise.all([
          walletController.getWalletBalance(user.id),
          transactionController.getUserTransactions(user.id, {}, { limit: 5 }),
          walletController.getWalletStats(user.id)
        ]);

        if (balanceResult.success) {
          setWalletBalance(balanceResult.data);
        }

        if (transactionsResult.success) {
          setRecentTransactions(transactionsResult.data);
        }

        if (walletStatsResult.success) {
          setDashboardStats(walletStatsResult.data);
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id, userRole]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Loading Dashboard</h3>
            <p>Preparing your personalized overview...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-400/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-red-400 mb-2">Dashboard Error</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={loadDashboardData} className="bg-red-600 hover:bg-red-700">
                Retry Loading
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Admin Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
              <p className="text-gray-400">System overview and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-600 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
            </div>
          </div>

          {/* Admin Stats Grid */}
          {dashboardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardStats.users?.total || 0}</div>
                  <p className="text-xs text-green-400">
                    +{dashboardStats.users?.newThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${dashboardStats.transactions?.totalVolume?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-blue-400">
                    {dashboardStats.transactions?.total || 0} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {((1 - (dashboardStats.system?.errorRate || 0)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-400">Uptime</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Security Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">
                    {dashboardStats.security?.securityAlerts || 0}
                  </div>
                  <p className="text-xs text-orange-300">Active alerts</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User Dashboard
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-400">Manage your finances and transactions</p>
          </div>
          
          {showQuickActions && (
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-600 text-white">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Send Money
              </Button>
            </div>
          )}
        </div>

        {/* Balance Card */}
        {walletBalance && (
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-80">Current Balance</p>
                  <p className="text-3xl font-bold">${walletBalance.current?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm opacity-80">
                    Available: ${walletBalance.available?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.totalTransactions || 0}
              </div>
              <p className="text-xs text-blue-400">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${dashboardStats?.monthlySpending?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-orange-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.paymentMethodsCount || 0}
              </div>
              <p className="text-xs text-green-400">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center gap-3">
                      {transaction.fromUserId === user?.id ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.fromUserId === user?.id ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {transaction.fromUserId === user?.id ? '-' : '+'}${transaction.amount?.toFixed(2)}
                      </p>
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
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 h-20">
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Send Money</span>
              </div>
            </Button>
            
            <Button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 h-20">
              <div className="text-center">
                <CreditCard className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Add Funds</span>
              </div>
            </Button>
            
            <Button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 h-20">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">View Analytics</span>
              </div>
            </Button>
            
            <Button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 h-20">
              <div className="text-center">
                <Settings className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Settings</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}