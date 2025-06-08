import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TransactionService } from "../services/TransactionService";

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all transactions for current user
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: TransactionService.getAllTransactions,
    enabled: !!user,
  });

  // Get transaction statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/transactions/stats", user?.id],
    queryFn: () => TransactionService.getTransactionStats(user?.id || ""),
    enabled: !!user,
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: TransactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/stats"] });
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    transactions: transactions || [],
    stats,
    user,

    // Loading states
    isLoading: transactionsLoading || statsLoading,
    transactionsLoading,
    statsLoading,

    // Actions
    deleteTransaction: deleteMutation.mutate,
    isDeletingTransaction: deleteMutation.isPending,

    // Helper functions from service
    formatAmount: TransactionService.formatAmount,
    formatStatus: TransactionService.formatStatus,
    getStatusColor: TransactionService.getStatusColor,
    getTransactionDirection: (transaction: any) => 
      TransactionService.getTransactionDirection(transaction, user?.id || ""),
    filterTransactions: TransactionService.filterTransactions,
    sortTransactions: TransactionService.sortTransactions,
  };
}