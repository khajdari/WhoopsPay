import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PaymentService } from "../services/PaymentService";
import { AdminService } from "../services/AdminService";
import { apiRequest } from "@/lib/queryClient";

export function useDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  // Transaction data
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: PaymentService.getTransactions,
    enabled: !!user,
  });

  // Pending requests
  const { data: pendingRequests, isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ["/api/pending-requests"],
    queryFn: PaymentService.getPendingRequests,
    enabled: !!user && !(user as any)?.isAdmin,
  });

  // Payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: () => PaymentService.getPaymentMethods(user?.id || ""),
    enabled: !!user,
  });

  // Admin data (only for admin users)
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/admin/health"],
    queryFn: AdminService.getSystemHealth,
    enabled: !!user && (user as any)?.isAdmin === 1,
    refetchInterval: 30000,
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: AdminService.getAllUsers,
    enabled: !!user && (user as any)?.isAdmin === 1,
  });

  const { data: allTransactions, isLoading: adminTransactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    queryFn: AdminService.getAllTransactions,
    enabled: !!user && (user as any)?.isAdmin === 1,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: PaymentService.approvePaymentRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      
      if (data?.redirect && data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: "Request Approved",
          description: "The money request has been approved successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: PaymentService.rejectPaymentRequest,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      
      if (data?.redirect && data?.redirectUrl) {
        toast({
          title: "External Payment Rejected",
          description: "Redirecting back to external site...",
        });
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1500);
      } else {
        toast({
          title: "Request Rejected",
          description: "The money request has been rejected.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    user,
    userProfile,
    transactions: transactions || [],
    pendingRequests: pendingRequests || [],
    paymentMethods: paymentMethods || [],
    systemHealth,
    allUsers: allUsers || [],
    allTransactions: allTransactions || [],

    // Loading states
    isLoading: profileLoading || transactionsLoading || pendingRequestsLoading || paymentMethodsLoading,
    profileLoading,
    transactionsLoading,
    pendingRequestsLoading,
    paymentMethodsLoading,
    healthLoading,
    usersLoading,
    adminTransactionsLoading,

    // Actions
    approveRequest: approveMutation.mutate,
    rejectRequest: rejectMutation.mutate,
    isApprovingRequest: approveMutation.isPending,
    isRejectingRequest: rejectMutation.isPending,

    // Helper functions
    isAdmin: !!(user as any)?.isAdmin,
    formatAmount: PaymentService.formatAmount,
    formatStatus: PaymentService.formatStatus,
    getStatusColor: PaymentService.getStatusColor,
  };
}