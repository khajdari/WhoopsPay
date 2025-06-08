import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminService } from "../../services/AdminService";
import { TransactionService } from "../../services/TransactionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Activity, 
  Shield, 
  AlertTriangle, 
  Server, 
  Database,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw
} from "lucide-react";

export function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch system health data
  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["/api/admin/health"],
    queryFn: AdminService.getSystemHealth,
    refetchInterval: 30000,
  });

  // Fetch all users
  const { data: allUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: AdminService.getAllUsers,
  });

  // Fetch all transactions
  const { data: allTransactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ["/api/admin/transactions"],
    queryFn: AdminService.getAllTransactions,
  });

  // Fetch all issues
  const { data: allIssues, isLoading: issuesLoading, refetch: refetchIssues } = useQuery({
    queryKey: ["/api/admin/issues"],
    queryFn: AdminService.getAllIssueReports,
  });

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchHealth(),
      refetchUsers(),
      refetchTransactions(),
      refetchIssues()
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate statistics
  const totalTransactionVolume = allTransactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  const pendingTransactions = allTransactions?.filter(t => t.status === 'pending').length || 0;
  const openIssues = allIssues?.filter(i => i.status === 'open').length || 0;
  const criticalIssues = allIssues?.filter(i => i.priority === 'critical').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">System Administration</h2>
          <p className="text-gray-400">Monitor and manage WhoopsPay platform</p>
        </div>
        
        <Button
          onClick={handleRefreshAll}
          disabled={refreshing}
          variant="outline"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">System Status</p>
                <p className="text-2xl font-bold text-green-400">Online</p>
              </div>
              <Server className="h-8 w-8 text-green-400" />
            </div>
            {systemHealth && (
              <div className="mt-2 text-xs text-gray-500">
                Started: {new Date(systemHealth.startTime).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Database</p>
                <p className="text-2xl font-bold text-green-400">Healthy</p>
              </div>
              <Database className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {systemHealth?.logs?.db?.length || 0} operations logged
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {usersLoading ? <Skeleton className="h-8 w-12" /> : allUsers?.length || 0}
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
                <p className="text-sm font-medium text-gray-400">Critical Issues</p>
                <p className={`text-2xl font-bold ${criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {issuesLoading ? <Skeleton className="h-8 w-8" /> : criticalIssues}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-yellow-400/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Users
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="issues" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Transaction Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {TransactionService.formatAmount(totalTransactionVolume)}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {allTransactions?.length || 0} total transactions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Pending Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {pendingTransactions}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Transactions awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {openIssues}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Open security reports
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gray-900 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {allUsers?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                          <span className="text-yellow-400 font-medium">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || user.id.charAt(1)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email || user.id
                            }
                          </div>
                          <div className="text-sm text-gray-400">
                            Balance: {TransactionService.formatAmount(user.balance || 0)}
                          </div>
                        </div>
                      </div>
                      {user.isAdmin && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                          Admin
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-gray-900 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {allTransactions?.slice(0, 10).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.isExternal ? 'bg-blue-500/20' : 'bg-gray-700'
                        }`}>
                          <Activity className={`w-4 h-4 ${
                            transaction.isExternal ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="text-white">
                            {TransactionService.formatAmount(transaction.amount)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {transaction.fromUserId} → {transaction.toUserId}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${TransactionService.getStatusColor(transaction.status)} border-current`}
                      >
                        {TransactionService.formatStatus(transaction.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card className="bg-gray-900 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400">Issue Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : allIssues && allIssues.length > 0 ? (
                <div className="space-y-3">
                  {allIssues.slice(0, 5).map((issue: any) => (
                    <div key={issue.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white mb-1">
                            {issue.title}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            {issue.description}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`${AdminService.getPriorityColor(issue.priority)} border-current`}
                            >
                              {AdminService.formatPriority(issue.priority)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${AdminService.getStatusColor(issue.status)} border-current`}
                            >
                              {AdminService.formatStatus(issue.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No issues reported</p>
                  <p className="text-sm">All systems running smoothly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}