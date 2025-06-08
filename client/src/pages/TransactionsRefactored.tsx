import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/layout";
import { TransactionList } from "@/components/business/TransactionList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Download,
  RefreshCw,
  DollarSign
} from "lucide-react";

export default function TransactionsRefactored() {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    transactions,
    stats,
    user,
    isLoading,
    deleteTransaction,
    isDeletingTransaction,
    formatAmount,
  } = useTransactions();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Create CSV export of transactions
    const csvData = transactions.map(t => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      From: t.fromUserId,
      To: t.toUserId,
      Amount: t.amount,
      Currency: t.currency,
      Status: t.status,
      Description: t.description || '',
      Type: t.isExternal ? 'External' : 'Internal'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="bg-black text-yellow-400 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
              <p className="text-gray-400">View and manage your payment transactions</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={handleExport}
                disabled={transactions.length === 0}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalTransactions || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Sent</p>
                    <p className="text-2xl font-bold text-red-400">
                      {isLoading ? <Skeleton className="h-8 w-20" /> : formatAmount(stats?.totalSent || 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Received</p>
                    <p className="text-2xl font-bold text-green-400">
                      {isLoading ? <Skeleton className="h-8 w-20" /> : formatAmount(stats?.totalReceived || 0)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-yellow-400">
                        {isLoading ? <Skeleton className="h-8 w-8" /> : stats?.pendingCount || 0}
                      </p>
                      {stats?.pendingCount && stats.pendingCount > 0 && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Average Transaction Amount */}
          {stats && (
            <Card className="bg-gray-900 border-yellow-400/30 mb-8">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Transaction Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Average Transaction</p>
                    <p className="text-xl font-semibold text-white">
                      {formatAmount(stats.averageAmount)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Net Balance Change</p>
                    <p className={`text-xl font-semibold ${
                      (stats.totalReceived - stats.totalSent) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatAmount(stats.totalReceived - stats.totalSent)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Transaction Volume</p>
                    <p className="text-xl font-semibold text-white">
                      {formatAmount(stats.totalSent + stats.totalReceived)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction List */}
          <Card className="bg-gray-900 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <TransactionList
                  transactions={transactions}
                  currentUserId={user?.id || ""}
                  onDelete={deleteTransaction}
                  showActions={true}
                  showFilters={true}
                  emptyMessage="No transactions found. Start by sending or receiving money to see your transaction history here."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}