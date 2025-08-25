import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);
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
      <DialogContent className="bg-white border-2 border-orange-600 text-gray-900 max-w-lg z-[9999] fixed rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-800 text-lg">
            {isApproval ? (
              <>
                <CheckCircle className="h-5 w-5" />
                {t('externalPaymentApproved')}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                {t('externalPaymentRejected')}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className="bg-orange-800 text-white px-3 py-1 rounded-full text-sm font-medium">
              {t('offUsPaymentRequest')}
            </span>
          </div>

          {/* Amount Display */}
          <div className="bg-orange-800 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">
              ¤ {orderInfo.amount.toFixed(2)}
            </div>
          </div>

          {/* From Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-800">
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">{t('fromLabel')}</span>
            </div>
            <div className="ml-6">
              <div className="text-gray-900 font-medium">{t('juiceShopMerchant')}</div>
              <div className="text-gray-600 text-sm">{t('externalMerchant')}</div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-800">
              <span className="font-medium">{t('descriptionLabel')}</span>
            </div>
            <div className="ml-6 text-gray-900 break-words">
              {orderInfo.description}
            </div>
          </div>

          {/* External Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-800">
              <span className="font-medium">{t('externalDetailsLabel')}</span>
            </div>
            <div className="ml-6 space-y-2 text-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">{t('orderIdColon')}</span>
                <span className="text-gray-900 text-right break-words">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">{t('sourceColon')}</span>
                <span className="text-gray-900 text-right">Juice-Shop</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">{t('returnUrlColon')}</span>
                <span className="text-gray-900 text-xs font-mono break-all text-right max-w-[180px]">
                  {redirectUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <p className="text-gray-700 mb-4 px-2 leading-relaxed">
              {isApproval 
                ? t('paymentProcessedSuccessfully') 
                : t('paymentRejectedMessage')
              }
            </p>
            
            {autoRedirect && countdown > 0 ? (
              <div className="space-y-3">
                <p className="text-orange-800 font-medium px-2">
                  {t('redirectingCountdown')} {countdown} {t('secondsText')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                  <Button 
                    onClick={handleManualRedirect}
                    className="bg-orange-800 hover:bg-orange-900 text-white font-medium px-4 py-2 text-sm"
                  >
                    {t('continueToService')}
                  </Button>
                  <Button 
                    onClick={handleCancelAutoRedirect}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 text-sm"
                  >
                    {t('cancelAutoRedirect')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <Button 
                  onClick={handleManualRedirect}
                  className="bg-orange-800 hover:bg-orange-900 text-white font-medium px-4 py-2 text-sm"
                >
                  {t('continueToService')}
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-400 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm"
                >
                  {t('stayHere')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}