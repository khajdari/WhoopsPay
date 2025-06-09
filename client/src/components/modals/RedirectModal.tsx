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
      <DialogContent className="bg-black border-yellow-400 text-white max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            {isApproval ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Payment Approved!
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                Payment Rejected
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-yellow-400 mb-2">Order Details:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-400">Item:</span> {orderInfo.description}</p>
              <p><span className="text-gray-400">Amount:</span> ${orderInfo.amount}</p>
              <p><span className="text-gray-400">Order ID:</span> {orderInfo.orderId}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-yellow-400 mb-2">Redirect URL:</h3>
            <p className="text-xs text-gray-300 break-all font-mono bg-gray-800 p-2 rounded">
              {redirectUrl}
            </p>
          </div>

          {autoRedirect && countdown > 0 ? (
            <div className="text-center">
              <p className="text-yellow-400 mb-3">
                Redirecting to Juice Shop in {countdown} seconds...
              </p>
              <div className="space-x-2">
                <Button 
                  onClick={handleManualRedirect}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Redirect Now
                </Button>
                <Button 
                  onClick={handleCancelAutoRedirect}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel Auto-redirect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-gray-300">
                {isApproval 
                  ? "Payment processed successfully!" 
                  : "Payment was rejected."
                }
              </p>
              <div className="space-x-2">
                <Button 
                  onClick={handleManualRedirect}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Juice Shop
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}