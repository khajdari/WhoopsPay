import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Server
} from "lucide-react";
import { AdminController } from "../../controllers/AdminController";
import { UserModel } from "../../models/UserModel";
import { TransactionModel } from "../../models/TransactionModel";

interface AdminViewProps {
  activeTab?: string;
  showSystemMetrics?: boolean;
}

export function AdminView({ 
  activeTab = "overview",
  showSystemMetrics = true 
}: AdminViewProps) {
  const [controller] = useState(() => new AdminController());
  
  // State management
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(activeTab);

  // Load admin data
  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResult, usersResult, alertsResult] = await Promise.all([
        controller.getDashboardStats(),
        controller.getUsers({}, { limit: 50 }),
        controller.getSystemAlerts({ limit: 10 })
      ]);

      if (statsResult.success) {
        setDashboardStats(statsResult.data);
      }

      if (usersResult.success) {
        setUsers(usersResult.data as UserModel[]);
      }

      if (alertsResult.success) {
        setSystemAlerts(alertsResult.data || []);
      }
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // User management actions
  const handleUserStatusUpdate = async (userId: string, status: 'active' | 'suspended') => {
    try {
      const result = await controller.updateUserStatus(userId, status, 'Admin action');
      if (result.success) {
        loadAdminData(); // Refresh data
      }
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      const result = await controller.promoteToAdmin(userId, 'admin');
      if (result.success) {
        loadAdminData(); // Refresh data
      }
    } catch (err) {
      setError('Failed to promote user');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium mb-2">Loading Admin Panel</h3>
            <p>Preparing system overview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Admin Panel
            </h1>
            <p className="text-gray-400">System monitoring and user management</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Security Center
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900/20 border-red-400/50">
            <CardContent className="p-4">
              <div className="text-red-400 font-medium">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* System Metrics Dashboard */}
        {showSystemMetrics && dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats.users?.total || 0}
                </div>
                <div className="text-xs text-green-400 mt-1">
                  +{dashboardStats.users?.newThisMonth || 0} this month
                </div>
                <div className="text-xs text-gray-400">
                  {dashboardStats.users?.adminCount || 0} admins
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Transaction Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${dashboardStats.transactions?.totalVolume?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-blue-400 mt-1">
                  {dashboardStats.transactions?.total || 0} transactions
                </div>
                <div className="text-xs text-yellow-400">
                  {dashboardStats.transactions?.pending || 0} pending
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {((1 - (dashboardStats.system?.errorRate || 0)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {dashboardStats.system?.activeConnections || 0} active connections
                </div>
                <div className="text-xs text-blue-400">
                  Load: {((dashboardStats.system?.systemLoad || 0) * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {dashboardStats.security?.securityAlerts || 0}
                </div>
                <div className="text-xs text-red-400 mt-1">
                  {dashboardStats.security?.flaggedTransactions || 0} flagged transactions
                </div>
                <div className="text-xs text-orange-400">
                  {dashboardStats.security?.suspiciousUsers || 0} suspicious users
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              User Management
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Transaction Monitor
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              System Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'User Registration', user: 'john.doe@example.com', time: '2 minutes ago', type: 'info' },
                      { action: 'Large Transaction Flagged', user: 'Transaction #12345', time: '5 minutes ago', type: 'warning' },
                      { action: 'Admin Login', user: 'admin@whoopspay.com', time: '15 minutes ago', type: 'info' },
                      { action: 'System Backup Completed', user: 'System', time: '1 hour ago', type: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-800">
                        <div>
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-gray-400 text-sm">{activity.user}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              activity.type === 'success' ? 'text-green-400 border-green-400' :
                              activity.type === 'warning' ? 'text-yellow-400 border-yellow-400' :
                              'text-blue-400 border-blue-400'
                            }`}
                          >
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-white">45%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Memory Usage</span>
                        <span className="text-white">67%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Database Load</span>
                        <span className="text-white">23%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* User Search */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by email, name, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-600 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 10).map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-lg bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-gray-400 text-sm">
                            {user.firstName} {user.lastName} • Joined {user.createdAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={user.isActive ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        {user.isAdmin && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            Admin
                          </Badge>
                        )}
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserStatusUpdate(user.id, user.isActive ? 'suspended' : 'active')}
                            className="border-gray-600 text-white"
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          
                          <Button size="sm" variant="outline" className="border-gray-600 text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {!user.isAdmin && (
                            <Button
                              size="sm"
                              onClick={() => handlePromoteUser(user.id)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-black"
                            >
                              Promote
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Transaction Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Transaction monitoring interface</p>
                  <p className="text-sm">Real-time transaction analysis and flagging</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p>No active system alerts</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {systemAlerts.map((alert, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-800 border-l-4 border-orange-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{alert.title}</p>
                            <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${
                              alert.severity === 'critical' ? 'text-red-400 border-red-400' :
                              alert.severity === 'high' ? 'text-orange-400 border-orange-400' :
                              alert.severity === 'medium' ? 'text-yellow-400 border-yellow-400' :
                              'text-blue-400 border-blue-400'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}