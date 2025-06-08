import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/requests/${requestId}/approve`, 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-requests"] });
      
      if (data.redirect && data.redirectUrl) {
        toast({
          title: "External Payment Approved",
          description: "Payment processed successfully. Redirecting back to Juice Shop...",
        });
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1500);
      } else {
        toast({
          title: "Request Approved",
          description: `Payment of $${request.amount} has been processed.`,
        });
      }
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve request",
        variant: "destructive",
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
        toast({
          title: "External Payment Rejected",
          description: "Redirecting back to Juice Shop...",
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
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject request",
        variant: "destructive",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
          <div className={`p-4 rounded-lg ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${request.amount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* From Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">From:</span>
            </div>
            {request.isExternal ? (
              <div className="pl-6">
                <p className="font-medium text-gray-900">
                  {request.fromUser?.firstName} {request.fromUser?.lastName}
                </p>
                <p className="text-sm text-gray-600">External Merchant</p>
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

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Description:</span>
            </div>
            <p className="pl-6 text-gray-900">{request.description}</p>
          </div>

          {/* External Details */}
          {request.isExternal && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
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

          <Separator />

          {/* Timestamp */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Requested:</span>
            </div>
            <p className="pl-6 text-sm text-gray-900">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
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
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
                  Approve
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}