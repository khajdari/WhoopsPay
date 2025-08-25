/**
 * WhoopsPay Money Request Modal - OWASP Vulnerability Training
 * 
 * WARNING: This component contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Client-side approval/rejection logic)
 * - A03: Injection (Unvalidated external URL redirects)
 * - A04: Insecure Design (Financial approval logic exposed to client)
 * - A05: Security Misconfiguration (External redirect handling)
 * - A07: Identification and Authentication Failures (Weak transaction validation)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API1: Broken Object Level Authorization (No server-side ownership validation)
 * - API7: Server Side Request Forgery (Unvalidated external redirects)
 * - API10: Unsafe Consumption of APIs (External payment system integration)
 * 
 * Financial Security Vulnerabilities:
 * - Payment approval/rejection handled primarily client-side
 * - External payment system redirects without proper validation
 * - Financial transaction state management exposed to frontend
 * - No multi-factor authentication for high-value transactions
 * - Insufficient validation of payment request authenticity
 * 
 * Educational Vulnerabilities Include:
 * - Client-side financial transaction approval logic
 * - Unvalidated external redirects to payment systems
 * - Payment request data manipulation possibilities
 * - Insufficient server-side validation of transaction states
 * - External payment integration security weaknesses
 * 
 * NEVER use this code in production environments!
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import { 
  Check, 
  X, 
  Loader2, 
  ExternalLink, 
  User, 
  Clock,
  FileText,
  Globe,
  CreditCard,
  Building
} from "lucide-react";

/**
 * Money Request Modal Props Interface
 * 
 * OWASP A04: Insecure Design - Type Safety Vulnerabilities
 * VULNERABLE: request type is 'any' allowing any data structure
 * This bypasses TypeScript's type safety and can lead to:
 * - Runtime errors from unexpected data structures
 * - Security vulnerabilities from malformed data
 * - Difficulty in validating payment request authenticity
 */
interface MoneyRequestModalProps {
  request: any; // VULNERABLE: Should have proper type definition
  isOpen: boolean;
  onClose: () => void;
  onExternalRedirect?: (redirectUrl: string, isApproval: boolean, orderInfo: any) => void; // VULNERABLE: Unvalidated redirect function
}

export default function MoneyRequestModal({ request, isOpen, onClose, onExternalRedirect }: MoneyRequestModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useI18n();

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/requests/${requestId}/approve`, 'POST');
    },
    onSuccess: (data: any) => {
      // Invalidate all relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // Invalidate user profiles to refresh balances
      queryClient.invalidateQueries({ queryKey: [`/api/users`] });
      
      if (data.redirect && data.redirectUrl && onExternalRedirect) {
        // Close this modal and trigger redirect from parent
        onClose();
        
        // Small delay to ensure clean transition
        setTimeout(() => {
          onExternalRedirect(data.redirectUrl, true, {
            description: request.description || 'Payment Request',
            amount: request.amount,
            orderId: request.externalOrderId || request.id.toString()
          });
        }, 100);
      } else {
        toast({
          title: t('paymentApprovedTitle'),
          description: t('paymentProcessedSuccessfully').replace('{{amount}}', request.amount.toString()),
          className: "bg-blue-50 border-blue-600 text-blue-800",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      // If request is not pending anymore, close modal and refresh data
      if (error.message?.includes("Request is not pending") || error.message?.includes("not pending")) {
        toast({
          title: "Request Already Processed",
          description: "This request has already been processed or is no longer available.",
          variant: "destructive",
          className: "bg-orange-50 border-orange-600 text-orange-800",
        });
        // Close modal and refresh data
        onClose();
        queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
        return;
      }
      
      toast({
        title: "Approval Failed", 
        description: error.message || "Failed to approve request",
        variant: "destructive",
        className: "bg-red-50 border-red-600 text-red-800",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/requests/${requestId}/reject`, 'POST');
    },
    onSuccess: (data: any) => {
      // Invalidate all relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // Invalidate user profiles to refresh balances
      queryClient.invalidateQueries({ queryKey: [`/api/users`] });
      
      if (data.redirect && data.redirectUrl && onExternalRedirect) {
        // Close this modal and trigger redirect from parent
        onClose();
        
        // Small delay to ensure clean transition
        setTimeout(() => {
          onExternalRedirect(data.redirectUrl, false, {
            description: request.description || 'Payment Request',
            amount: request.amount,
            orderId: request.externalOrderId || request.id.toString()
          });
        }, 100);
      } else {
        toast({
          title: "Payment Rejected",
          description: "The money request has been rejected.",
          className: "bg-red-50 border-red-600 text-red-800",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      // If request is not pending anymore, close modal and refresh data
      if (error.message?.includes("Request is not pending") || error.message?.includes("not pending")) {
        toast({
          title: "Request Already Processed",
          description: "This request has already been processed or is no longer available.",
          variant: "destructive", 
          className: "bg-orange-50 border-orange-600 text-orange-800",
        });
        // Close modal and refresh data
        onClose();
        queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
        return;
      }
      
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject request",
        variant: "destructive",
        className: "bg-red-50 border-red-600 text-red-800",
      });
    },
  });

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveMutation.mutateAsync(request.id);
    } catch (error) {
      console.log('Request approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectMutation.mutateAsync(request.id);
    } catch (error) {
      console.log('Request rejection failed:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const getRequestTypeInfo = () => {
    if (request.isExternal || request.type === 'external') {
      return {
        icon: <ExternalLink className="w-5 h-5 text-orange-800" />,
        label: t('offUsPaymentRequest'),
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        badgeColor: "bg-orange-100 text-orange-800"
      };
    }
    return {
      icon: <User className="w-5 h-5 text-blue-600" />,
      label: t('onUsMoneyRequest'),
      bgColor: "bg-blue-50", 
      borderColor: "border-blue-200",
      badgeColor: "bg-blue-100 text-blue-800"
    };
  };

  const typeInfo = getRequestTypeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-2 border-blue-600 text-gray-900">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            (request.isExternal || request.type === 'external') 
              ? 'text-orange-800' 
              : 'text-blue-600'
          }`}>
            {typeInfo.icon}
            {t('moneyRequestDetails')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Type Badge */}
          <div className="flex justify-center">
            <Badge className={typeInfo.badgeColor}>
              {typeInfo.label}
            </Badge>
          </div>

          {/* Amount */}
          <div className={`p-4 rounded-lg ${
            (request.isExternal || request.type === 'external') 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold">
                ¤{request.amount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* From Information */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${
              (request.isExternal || request.type === 'external') 
                ? 'text-orange-800' 
                : 'text-blue-600'
            }`}>
              <User className="w-4 h-4" />
              <span className="font-medium">{t('fromColon')}</span>
            </div>
            {request.isExternal ? (
              <div className="pl-6">
                <p className="font-medium text-gray-900">
                  {request.fromUser?.firstName} {request.fromUser?.lastName}
                </p>
                <p className="text-sm text-gray-600">{t('externalMerchant')}</p>
              </div>
            ) : (
              <div className="pl-6">
                <p className="font-medium text-gray-900">
                  {request.fromUser?.firstName} {request.fromUser?.lastName}
                </p>
                <p className="text-sm text-gray-600">{request.fromUser?.email}</p>
                <p className="text-xs text-gray-500">{request.fromUserId}</p>
              </div>
            )}
          </div>

          <Separator className="bg-gray-300" />

          {/* Description */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${
              (request.isExternal || request.type === 'external') 
                ? 'text-orange-800' 
                : 'text-blue-600'
            }`}>
              <FileText className="w-4 h-4" />
              <span className="font-medium">{t('descriptionColon')}</span>
            </div>
            <p className="pl-6 text-gray-900">{request.description}</p>
          </div>

          {/* External Details */}
          {request.isExternal && (
            <>
              <Separator className="bg-gray-300" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">External Details:</span>
                </div>
                <div className="pl-6 space-y-2">
                  {request.externalOrderId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-gray-900">{request.externalOrderId}</span>
                    </div>
                  )}
                  {request.externalSource && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Source:</span>
                      <span className="text-gray-900 capitalize">{request.externalSource}</span>
                    </div>
                  )}
                  {request.returnUrl && (
                    <div className="text-sm">
                      <span className="text-gray-600">Return URL:</span>
                      <p className="text-xs text-gray-500 break-all mt-1">{request.returnUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-gray-300" />

          {/* Timestamp */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${
              (request.isExternal || request.type === 'external') 
                ? 'text-orange-800' 
                : 'text-blue-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">{t('requested')}</span>
            </div>
            <p className="pl-6 text-sm text-gray-900">
              {formatDistanceToNow(new Date(request.createdAt), { 
                addSuffix: true,
                locale: language === 'el-GR' ? el : undefined 
              })}
            </p>
            <p className="pl-6 text-xs text-gray-500">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('rejecting')}
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  {t('rejectButton')}
                </>
              )}
            </Button>
            
            <Button
              onClick={handleApprove}
              className={`flex-1 text-white font-semibold ${
                (request.isExternal || request.type === 'external')
                  ? 'bg-orange-800 hover:bg-orange-900'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('approving')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('approvePayment')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}