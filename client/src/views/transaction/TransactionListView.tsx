import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  DollarSign
} from "lucide-react";
import { TransactionController, type TransactionFilters } from "../../controllers/TransactionController";
import { TransactionModel } from "../../models/TransactionModel";
import { useAuth } from "../../hooks/useAuth";

interface TransactionListViewProps {
  userId?: string;
  showFilters?: boolean;
  showExport?: boolean;
  limit?: number;
  onTransactionClick?: (transaction: TransactionModel) => void;
}

export function TransactionListView({
  userId,
  showFilters = true,
  showExport = true,
  limit = 20,
  onTransactionClick
}: TransactionListViewProps) {
  const { user } = useAuth();
  const [controller] = useState(() => new TransactionController());
  
  // State management
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Load transactions
  const loadTransactions = async (resetPage = false) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = resetPage ? 1 : page;
      const result = userId 
        ? await controller.getUserTransactions(
            userId, 
            filters, 
            { page: currentPage, limit, sort: 'createdAt', order: 'desc' }
          )
        : await controller.getTransactions(
            filters,
            { page: currentPage, limit, sort: 'createdAt', order: 'desc' }
          );

      if (result.success) {
        const newTransactions = result.data as TransactionModel[];
        
        if (resetPage) {
          setTransactions(newTransactions);
          setPage(1);
        } else {
          setTransactions(prev => currentPage === 1 ? newTransactions : [...prev, ...newTransactions]);
        }
        
        setHasMore(result.metadata?.hasNext || false);
        setTotalCount(result.metadata?.total || 0);
      } else {
        setError(result.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Search transactions
  const searchTransactions = async () => {
    if (!searchQuery.trim()) {
      loadTransactions(true);
      return;
    }

    setLoading(true);
    try {
      const result = await controller.searchTransactions(
        searchQuery,
        filters,
        { page: 1, limit, sort: 'createdAt', order: 'desc' }
      );

      if (result.success) {
        setTransactions(result.data as TransactionModel[]);
        setHasMore(result.metadata?.hasNext || false);
        setTotalCount(result.metadata?.total || 0);
        setPage(1);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError('Search error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Export transactions
  const exportTransactions = async () => {
    try {
      const result = await controller.exportTransactions(filters, 'csv');
      
      if (result.success) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Export failed');
    }
  };

  // Load more transactions
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Update filters
  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  // Effects
  useEffect(() => {
    loadTransactions(true);
  }, [filters, userId]);

  useEffect(() => {
    if (page > 1) {
      loadTransactions(false);
    }
  }, [page]);

  // Render transaction status
  const renderStatus = (transaction: TransactionModel) => {
    const statusColors = {
      pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50',
      completed: 'bg-green-400/20 text-green-400 border-green-400/50',
      failed: 'bg-red-400/20 text-red-400 border-red-400/50',
      cancelled: 'bg-gray-400/20 text-gray-400 border-gray-400/50'
    };

    return (
      <Badge className={statusColors[transaction.status as keyof typeof statusColors] || statusColors.pending}>
        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
      </Badge>
    );
  };

  // Render transaction direction
  const renderDirection = (transaction: TransactionModel) => {
    if (!user) return null;

    const isIncoming = transaction.isIncoming(user.id);
    const isOutgoing = transaction.isOutgoing(user.id);

    if (isIncoming) {
      return (
        <div className="flex items-center text-green-400">
          <ArrowDownLeft className="w-4 h-4 mr-1" />
          <span className="text-sm">Received</span>
        </div>
      );
    }

    if (isOutgoing) {
      return (
        <div className="flex items-center text-red-400">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span className="text-sm">Sent</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-blue-400">
        <DollarSign className="w-4 h-4 mr-1" />
        <span className="text-sm">Internal</span>
      </div>
    );
  };

  // Render transaction card
  const renderTransaction = (transaction: TransactionModel) => (
    <Card 
      key={transaction.id}
      className="bg-gray-900 border-gray-700 hover:border-yellow-400/50 transition-colors cursor-pointer"
      onClick={() => onTransactionClick?.(transaction)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">#{transaction.id}</span>
              {renderStatus(transaction)}
              {transaction.isExternal() && (
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  External
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              {transaction.description || 'No description'}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {transaction.formatAmount()}
            </div>
            {transaction.feeAmount > 0 && (
              <div className="text-xs text-gray-400">
                Fee: {transaction.formatFeeAmount()}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {renderDirection(transaction)}
            
            <div className="text-sm text-gray-400">
              <div>From: {transaction.fromUserId}</div>
              <div>To: {transaction.toUserId}</div>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-400">
            <div>{transaction.createdAt.toLocaleDateString()}</div>
            <div>{transaction.createdAt.toLocaleTimeString()}</div>
          </div>
        </div>

        {transaction.externalSource && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-blue-400">
              External Source: {transaction.externalSource}
              {transaction.externalOrderId && (
                <span className="ml-2">Order: {transaction.externalOrderId}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            Transactions
          </h2>
          <p className="text-gray-400">
            {totalCount > 0 ? `${totalCount} transactions found` : 'No transactions found'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => loadTransactions(true)}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {showExport && (
            <Button
              onClick={exportTransactions}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTransactions()}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                />
              </div>
              <Button
                onClick={searchTransactions}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Search
              </Button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.type || ""}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Amount"
                type="number"
                value={filters.minAmount || ""}
                onChange={(e) => updateFilter('minAmount', parseFloat(e.target.value) || undefined)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />

              <Input
                placeholder="Max Amount"
                type="number"
                value={filters.maxAmount || ""}
                onChange={(e) => updateFilter('maxAmount', parseFloat(e.target.value) || undefined)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Clear Filters */}
            {(Object.keys(filters).length > 0 || searchQuery) && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-400/50">
          <CardContent className="p-4">
            <div className="text-red-400 font-medium">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map(renderTransaction)}
        
        {loading && transactions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            Loading transactions...
          </div>
        )}

        {!loading && transactions.length === 0 && !error && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-400">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'No transactions to display'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Load More Transactions
            </Button>
          </div>
        )}

        {loading && transactions.length > 0 && (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-yellow-400" />
          </div>
        )}
      </div>
    </div>
  );
}