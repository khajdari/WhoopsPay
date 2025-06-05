import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Shield, ArrowLeft, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExternalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    amount: string;
    description: string;
    source: string;
    returnUrl: string;
    cancelUrl: string;
  } | null;
}

export function ExternalPaymentModal({ isOpen, onClose, paymentData }: ExternalPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processPaymentMutation = useMutation({
    mutationFn: async (action: 'approve' | 'cancel') => {
      if (action === 'approve') {
        return await apiRequest("/api/external/payment", "POST", {
          amount: paymentData?.amount,
          description: paymentData?.description,
          source: paymentData?.source,
          returnUrl: paymentData?.returnUrl,
          cancelUrl: paymentData?.cancelUrl
        });
      }
      return { action: 'cancelled' };
    },
    onSuccess: (data, action) => {
      setIsProcessing(false);
      
      if (action === 'approve') {
        toast({
          title: "Payment Approved",
          description: "Redirecting back to Juice Shop...",
        });
        
        setTimeout(() => {
          window.location.href = paymentData?.returnUrl || '/juice-shop?status=success';
        }, 1500);
      } else {
        toast({
          title: "Payment Cancelled",
          description: "Redirecting back to Juice Shop...",
          variant: "destructive"
        });
        
        setTimeout(() => {
          window.location.href = paymentData?.cancelUrl || '/juice-shop?status=cancelled';
        }, 1500);
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleApprove = () => {
    setIsProcessing(true);
    processPaymentMutation.mutate('approve');
  };

  const handleCancel = () => {
    setIsProcessing(true);
    processPaymentMutation.mutate('cancel');
  };

  if (!paymentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <span>Confirm Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Source */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🥤</span>
              <div>
                <p className="font-medium text-green-800">OWASP Juice Shop</p>
                <p className="text-sm text-green-600">External payment request</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-2xl text-gray-900">
                    ${paymentData.amount}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{paymentData.description}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment processing by WhoopsPay</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Security Notice</p>
              <p>This payment will be processed securely through WhoopsPay. You will be redirected back to Juice Shop after completion.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Approve Payment - ${paymentData.amount}</span>
                </div>
              )}
            </Button>

            <Button
              onClick={handleCancel}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5" />
                <span>Cancel Payment</span>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/juice-shop'}
              variant="ghost"
              className="w-full text-sm"
              disabled={isProcessing}
            >
              <div className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Juice Shop</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}