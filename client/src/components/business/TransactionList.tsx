import { useState } from "react";
import { TransactionCard } from "./TransactionCard";
import { TransactionService, type Transaction, type TransactionFilters } from "../../services/TransactionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, SortAsc, SortDesc, Search } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  currentUserId: string;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  title?: string;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  currentUserId,
  onDelete,
  showActions = false,
  showFilters = true,
  compact = false,
  title = "Transactions",
  emptyMessage = "No transactions found"
}: TransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters and sorting
  const filteredTransactions = TransactionService.filterTransactions(transactions, filters);
  const searchedTransactions = filteredTransactions.filter(transaction => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.fromUserId.toLowerCase().includes(searchLower) ||
      transaction.toUserId.toLowerCase().includes(searchLower) ||
      transaction.amount.includes(searchTerm) ||
      transaction.status.toLowerCase().includes(searchLower)
    );
  });
  const sortedTransactions = TransactionService.sortTransactions(searchedTransactions, sortBy, sortOrder);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card className="bg-gray-900 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status || ""} onValueChange={(value) => 
                setFilters({...filters, status: value || undefined})
              }>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={filters.type || ""} onValueChange={(value) => 
                setFilters({...filters, type: value || undefined})
              }>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'status') => setSortBy(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order and Reset */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                placeholder="Min amount"
                type="number"
                value={filters.amountMin || ''}
                onChange={(e) => setFilters({...filters, amountMin: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input
                placeholder="Max amount"
                type="number"
                value={filters.amountMax || ''}
                onChange={(e) => setFilters({...filters, amountMax: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-400">
              Showing {sortedTransactions.length} of {transactions.length} transactions
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No transactions match your filters</p>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mt-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          sortedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              currentUserId={currentUserId}
              onDelete={onDelete}
              showActions={showActions}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}