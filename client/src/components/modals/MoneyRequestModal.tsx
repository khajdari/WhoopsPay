import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { RedirectModal } from "./RedirectModal";
import { 
  Check, 
  X, 
  Loader2, 
  ExternalLink, 
  User, 
  DollarSign, 
  Clock,
  FileText,
  Globe,
  CreditCard,
  Building
} from "lucide-react";

interface MoneyRequestModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MoneyRequestModal({ request, isOpen, onClose }: MoneyRequestModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectData, setRedirectData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/requests/${requestId}/approve`, 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      
      if (data.redirect && data.redirectUrl) {
        // Close this modal immediately and show redirect modal
        onClose();
        
        // Small delay to ensure clean transition
        setTimeout(() => {
          setRedirectData({
            redirectUrl: data.redirectUrl,
            isApproval: true,
            orderInfo: {
              description: request.description || 'Payment Request',
              amount: request.amount,
              orderId: request.externalOrderId || request.id.toString()
            }
          });
          setShowRedirectModal(true);
        }, 100);
      } else {
        toast({
          title: "Payment Approved!",
          description: `Payment of $${request.amount} has been processed successfully.`,
          className: "bg-black border-yellow-400 text-yellow-400",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve request",
        variant: "destructive",
        className: "bg-red-900 border-red-500 text-red-100",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/requests/${requestId}/reject`, 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      
      if (data.redirect && data.redirectUrl) {
        // Close this modal immediately and show redirect modal
        onClose();
        
        // Small delay to ensure clean transition
        setTimeout(() => {
          setRedirectData({
            redirectUrl: data.redirectUrl,
            isApproval: false,
            orderInfo: {
              description: request.description || 'Payment Request',
              amount: request.amount,
              orderId: request.externalOrderId || request.id.toString()
            }
          });
          setShowRedirectModal(true);
        }, 100);
      } else {
        toast({
          title: "Payment Rejected",
          description: "The money request has been rejected.",
          className: "bg-red-900 border-red-500 text-red-100",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject request",
        variant: "destructive",
        className: "bg-red-900 border-red-500 text-red-100",
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
    if (request.isExternal) {
      return {
        icon: <ExternalLink className="w-5 h-5 text-blue-600" />,
        label: "External Payment Request",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        badgeColor: "bg-blue-100 text-blue-800"
      };
    }
    return {
      icon: <User className="w-5 h-5 text-orange-600" />,
      label: "Internal Money Request",
      bgColor: "bg-orange-50", 
      borderColor: "border-orange-200",
      badgeColor: "bg-orange-100 text-orange-800"
    };
  };

  const typeInfo = getRequestTypeInfo();

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black border-yellow-400 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            {typeInfo.icon}
            Money Request Details
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
          <div className="p-4 rounded-lg bg-yellow-400 border border-yellow-500">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6 text-black" />
              <span className="text-2xl font-bold text-black">
                ${request.amount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* From Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <User className="w-4 h-4" />
              <span className="font-medium">From:</span>
            </div>
            {request.isExternal ? (
              <div className="pl-6">
                <p className="font-medium text-white">
                  {request.fromUser?.firstName} {request.fromUser?.lastName}
                </p>
                <p className="text-sm text-gray-300">External Merchant</p>
              </div>
            ) : (
              <div className="pl-6">
                <p className="font-medium text-white">
                  {request.fromUser?.firstName} {request.fromUser?.lastName}
                </p>
                <p className="text-sm text-gray-300">{request.fromUser?.email}</p>
                <p className="text-xs text-gray-400">{request.fromUserId}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Description:</span>
            </div>
            <p className="pl-6 text-white">{request.description}</p>
          </div>

          {/* External Details */}
          {request.isExternal && (
            <>
              <Separator className="bg-gray-700" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">External Details:</span>
                </div>
                <div className="pl-6 space-y-2">
                  {request.externalOrderId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Order ID:</span>
                      <span className="font-mono text-white">{request.externalOrderId}</span>
                    </div>
                  )}
                  {request.externalSource && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Source:</span>
                      <span className="text-white capitalize">{request.externalSource}</span>
                    </div>
                  )}
                  {request.returnUrl && (
                    <div className="text-sm">
                      <span className="text-gray-300">Return URL:</span>
                      <p className="text-xs text-gray-400 break-all mt-1">{request.returnUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-gray-700" />

          {/* Timestamp */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Requested:</span>
            </div>
            <p className="pl-6 text-sm text-white">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </p>
            <p className="pl-6 text-xs text-gray-400">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20 bg-transparent"
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
            
            <Button
              onClick={handleApprove}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Redirect Modal for External Payments */}
    {redirectData && (
      <RedirectModal
        isOpen={showRedirectModal}
        onClose={() => {
          setShowRedirectModal(false);
          setRedirectData(null);
          onClose(); // Close the original request modal
        }}
        redirectUrl={redirectData.redirectUrl}
        isApproval={redirectData.isApproval}
        orderInfo={redirectData.orderInfo}
      />
    )}
  </>
  );
}