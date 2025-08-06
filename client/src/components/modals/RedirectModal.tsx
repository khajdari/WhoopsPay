import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl: string;
  isApproval: boolean;
  orderInfo: {
    description: string;
    amount: number;
    orderId: string;
  };
}

export function RedirectModal({ 
  isOpen, 
  onClose, 
  redirectUrl, 
  isApproval,
  orderInfo 
}: RedirectModalProps) {
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!isOpen || !autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, redirectUrl, autoRedirect]);

  const handleManualRedirect = () => {
    window.location.href = redirectUrl;
  };

  const handleCancelAutoRedirect = () => {
    setAutoRedirect(false);
    setCountdown(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-2 border-blue-600 text-gray-900 max-w-lg z-[9999] fixed rounded-lg">
        <DialogHeader className="relative">
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            ×
          </button>
          <DialogTitle className="flex items-center gap-2 text-blue-600 text-lg">
            {isApproval ? (
              <>
                <CheckCircle className="h-5 w-5" />
                External Payment Approved
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                External Payment Rejected
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              External Payment Request
            </span>
          </div>

          {/* Amount Display */}
          <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">
              ¤ {orderInfo.amount.toFixed(2)}
            </div>
          </div>

          {/* From Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">From:</span>
            </div>
            <div className="ml-6">
              <div className="text-gray-900 font-medium">Juice Shop</div>
              <div className="text-gray-600 text-sm">External Merchant</div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="font-medium">Description:</span>
            </div>
            <div className="ml-6 text-gray-900">
              {orderInfo.description}
            </div>
          </div>

          {/* External Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="font-medium">External Details:</span>
            </div>
            <div className="ml-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="text-gray-900">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Source:</span>
                <span className="text-gray-900">Juice-Shop</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Return URL:</span>
                <span className="text-gray-900 text-xs font-mono break-all max-w-xs">
                  {redirectUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              {isApproval 
                ? "Payment has been processed successfully. You will be redirected to complete your order." 
                : "Payment was rejected. You will be redirected back to the merchant."
              }
            </p>
            
            {autoRedirect && countdown > 0 ? (
              <div className="space-y-3">
                <p className="text-blue-600 font-medium">
                  Redirecting to Juice Shop in {countdown} seconds...
                </p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={handleManualRedirect}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
                  >
                    Continue to Juice Shop
                  </Button>
                  <Button 
                    onClick={handleCancelAutoRedirect}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 px-6 py-2"
                  >
                    Cancel Auto-redirect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={handleManualRedirect}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
                >
                  Continue to Juice Shop
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-400 text-gray-700 hover:bg-gray-50 px-6 py-2"
                >
                  Stay Here
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}