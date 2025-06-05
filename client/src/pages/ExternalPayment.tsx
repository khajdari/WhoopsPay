import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, ExternalLink, Shield, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ExternalTransaction {
  id: number;
  amount: number;
  description: string;
  status: string;
  externalOrderId?: string;
  externalSource?: string;
  returnUrl?: string;
  cancelUrl?: string;
  externalMetadata?: string;
  createdAt: number;
}

export default function ExternalPayment() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch transaction details
  const { data: transaction, isLoading, error, refetch } = useQuery<ExternalTransaction>({
    queryKey: [`/api/external/payment/${transactionId}/status`],
    enabled: !!transactionId,
    refetchInterval: (data) => {
      return data?.status === "external_pending" ? 5000 : false;
    },
  });

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/external/payment/${transactionId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Approved",
        description: "The payment has been successfully approved.",
      });
      setIsProcessing(true);
      
      // Redirect back to external source after short delay
      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = `${data.redirectUrl}?status=success&transactionId=${transactionId}`;
        }
      }, 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Approval Failed",
        description: "Failed to approve payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/external/payment/${transactionId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Rejected",
        description: "The payment has been rejected.",
        variant: "destructive",
      });
      setIsProcessing(true);
      
      // Redirect back to external source after short delay
      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = `${data.redirectUrl}?status=cancelled&transactionId=${transactionId}`;
        }
      }, 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Rejection Failed",
        description: "Failed to reject payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to approve this payment.",
        variant: "destructive",
      });
      setTimeout(() => {
        const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=payment&from=${encodeURIComponent(currentUrl)}`;
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span>Loading payment details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The payment request could not be found or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If payment is already processed
  if (transaction.status !== "external_pending") {
    const isApproved = transaction.status === "completed";
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            {isApproved ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">
              Payment {isApproved ? "Approved" : "Rejected"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This payment has already been {isApproved ? "approved" : "rejected"}.
            </p>
            {transaction.returnUrl && (
              <Button 
                onClick={() => window.location.href = transaction.returnUrl!}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Return to {transaction.externalSource || "Source"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const sourceDisplayName = transaction.externalSource === "juice-shop" 
    ? "OWASP Juice Shop" 
    : transaction.externalSource || "External Store";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhoopsPay</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Secure Payment Authorization</p>
          </div>

          {/* Payment Request Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>External Payment Request</span>
                </CardTitle>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Pending Approval
                </Badge>
              </div>
              <CardDescription>
                {sourceDisplayName} is requesting payment authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Amount */}
              <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Payment Amount
                </div>
              </div>

              <Separator />

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="text-sm">{transaction.description}</span>
                </div>
                
                {transaction.externalOrderId && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="text-sm font-mono">{transaction.externalOrderId}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Source:</span>
                  <span className="text-sm">{sourceDisplayName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <span className="text-sm font-mono">{transaction.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Requested:</span>
                  <span className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isProcessing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="w-full h-14"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject Payment"}
              </Button>
              
              <Button
                size="lg"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="w-full h-14 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {approveMutation.isPending ? "Approving..." : "Approve Payment"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-medium">Processing your decision...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You will be redirected back to {sourceDisplayName} shortly.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Security Notice
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    This is an educational vulnerability demonstration platform. 
                    In a real system, additional security measures would be implemented 
                    to prevent unauthorized payment approvals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}