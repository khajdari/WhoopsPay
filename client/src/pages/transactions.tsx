/**
 * Transaction History Page - Financial transaction management and analysis
 * 
 * Comprehensive transaction viewing interface providing:
 * - Complete transaction history with search and filtering
 * - Real-time pagination and data management
 * - Advanced filtering by transaction type and status
 * - Mobile-responsive transaction display
 * - Detailed transaction information with security context
 * 
 * Educational Security Features:
 * - Demonstrates client-side data filtering vulnerabilities
 * - Shows improper access control through visible data exposure
 * - Includes pagination without proper authorization checks
 * 
 * VULNERABILITY NOTE: Client-side filtering exposes all transaction
 * data for educational security training purposes.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { TransactionItem } from "@/components/transaction-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/**
 * Transactions Component - Financial history management interface
 * 
 * Main transactions page providing comprehensive transaction viewing
 * and management capabilities. Features include:
 * - Search functionality across transaction fields
 * - Type-based filtering (sent, received, all)
 * - Paginated display with navigation controls
 * - Real-time transaction data synchronization
 * - Mobile-optimized transaction list display
 */
export default function Transactions() {
  const { user } = useAuth();
  
  /**
   * Transaction Filter State - Search and pagination controls
   * 
   * State management for transaction filtering and display:
   * - searchQuery: Text search across transaction fields
   * - filterType: Transaction direction filter (all, sent, received)
   * - currentPage: Current pagination page number
   * - itemsPerPage: Number of transactions per page
   */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Transactions Query - Fetch all transaction data
   * 
   * Retrieves complete transaction history for the authenticated user.
   * 
   * VULNERABILITY NOTE: Fetches all transactions without server-side
   * filtering for educational security training purposes.
   */
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  /**
   * Client-Side Transaction Filtering - VULNERABLE IMPLEMENTATION
   * 
   * Filters transactions based on user input and filter criteria.
   * This implementation exposes potential security issues:
   * - All transaction data loaded to client
   * - No server-side access control validation
   * - Potential data exposure through filtering logic
   * 
   * VULNERABILITY NOTE: Client-side filtering exposes sensitive
   * transaction data for educational security training.
   */
  const transactionsList = Array.isArray(transactions) ? transactions : [];
  const filteredTransactions = transactionsList.filter((transaction: any) => {
    if (filterType === "sent" && transaction.fromUserId !== user?.id) return false;
    if (filterType === "received" && transaction.toUserId !== user?.id) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Search by user ID if query starts with @
      if (query.startsWith('@')) {
        const userQuery = query.substring(1);
        return (
          transaction.fromUserId?.toLowerCase().includes(userQuery) ||
          transaction.toUserId?.toLowerCase().includes(userQuery)
        );
      }
      
      // Search by amount if query is a number
      if (!isNaN(parseFloat(query)) && isFinite(parseFloat(query))) {
        return transaction.amount?.toString().includes(query);
      }
      
      // Search by transaction type and description for text queries
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.status?.toLowerCase().includes(query) ||
        transaction.type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  /**
   * Pagination Logic - Calculate page boundaries and current data slice
   * 
   * Handles pagination calculations for transaction display including
   * total pages, current slice boundaries, and data extraction.
   */
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  /**
   * Next Page Navigation - Move to next page if available
   * 
   * Handles forward pagination navigation with boundary checking
   * to prevent navigation beyond available pages.
   */
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Previous Page Navigation - Move to previous page if available
   * 
   * Handles backward pagination navigation with boundary checking
   * to prevent navigation below page 1.
   */
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Search Change Handler - Update search query and reset pagination
   * 
   * Handles search input changes and resets pagination to page 1
   * to ensure users see filtered results from the beginning.
   * 
   * @param value - New search query string
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  /**
   * Filter Change Handler - Update filter type and reset pagination
   * 
   * Handles filter type changes and resets pagination to page 1
   * to ensure users see filtered results from the beginning.
   * 
   * @param value - New filter type (all, sent, received)
   */
  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">View all your payment activity</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or amount..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All transactions</SelectItem>
                    <SelectItem value="sent">Money sent</SelectItem>
                    <SelectItem value="received">Money received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <>
                <div className="divide-y divide-gray-200">
                  {currentTransactions.map((transaction: any) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="flex items-center space-x-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </Button>
                        <span className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="flex items-center space-x-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Try adjusting your search" : "You haven't made any transactions yet"}
                </p>
                <Button className="mt-4 bg-paypal-blue hover:bg-paypal-darkblue text-white">
                  Send Money
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
