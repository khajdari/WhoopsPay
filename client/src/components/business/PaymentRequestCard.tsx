import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, ExternalLink, Clock } from "lucide-react";

interface PaymentRequest {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  description?: string;
  status: string;
  createdAt: number;
  isExternal?: boolean;
  source?: string;
  orderId?: string;
}

interface PaymentRequestCardProps {
  request: PaymentRequest;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  showActions?: boolean;
}

export function PaymentRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  isApproving = false, 
  isRejecting = false,
  showActions = true 
}: PaymentRequestCardProps) {
  const isExternal = !!(request.isExternal || request.source);
  const source = request.source || 'External';
  
  const formatAmount = (amount: string, currency = "GCU"): string => {
    const numAmount = parseFloat(amount);
    // Use generic currency symbol instead of specific currency
    return `¤${numAmount.toFixed(2)}`;
  };

  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return '🟡 Pending';
      case 'completed': return '✅ Completed';
      case 'failed': return '❌ Failed';
      case 'cancelled': return '⭕ Cancelled';
      case 'approved': return '✅ Approved';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'approved': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'rejected': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className={`bg-gray-900 border transition-colors ${
      isExternal ? 'border-blue-400/50 bg-blue-950/20' : 'border-yellow-400/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-medium text-white">
                {formatAmount(request.amount, request.currency)}
              </div>
              {isExternal && (
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {source}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${getStatusColor(request.status)} border-current`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatStatus(request.status)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-400 mb-1">
              From: {request.fromUserId}
            </div>
            
            {request.description && (
              <div className="text-sm text-gray-300 mb-2">
                {request.description}
              </div>
            )}
            
            {isExternal && request.orderId && (
              <div className="text-xs text-blue-400">
                Order: {request.orderId}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>

          {showActions && request.status === 'pending' && (
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                onClick={() => onApprove?.(request.id)}
                disabled={isApproving || isRejecting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject?.(request.id)}
                disabled={isApproving || isRejecting}
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}