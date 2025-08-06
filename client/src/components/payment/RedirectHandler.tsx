import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface RedirectHandlerProps {
  status: 'approved' | 'rejected';
  orderId: string;
  amount?: string;
  returnTo: string;
  redirectUrl: string;
}

export function RedirectHandler() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status') as 'approved' | 'rejected';
  const orderId = urlParams.get('orderId') || '';
  const amount = urlParams.get('amount');
  const returnTo = urlParams.get('returnTo') || '';
  const redirectUrl = decodeURIComponent(urlParams.get('url') || '');
  
  const isApproved = status === 'approved';
  const isExternal = !!redirectUrl;

  useEffect(() => {
    if (!isExternal || !redirectUrl || !isApproved) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExternal, redirectUrl, isApproved]);

  const handleAutoRedirect = () => {
    if (!redirectUrl) return;
    setRedirecting(true);
    setTimeout(() => {
      // For Juice Shop, construct the correct URL
      if (returnTo === 'juice-shop') {
        const juiceShopUrl = `/juice-shop?success=1&orderId=${orderId}&amount=${amount}`;
        window.location.href = juiceShopUrl;
      } else {
        window.location.href = redirectUrl;
      }
    }, 500);
  };

  const handleManualRedirect = () => {
    if (!redirectUrl) return;
    // For Juice Shop, construct the correct URL
    if (returnTo === 'juice-shop') {
      const juiceShopUrl = `/juice-shop?success=1&orderId=${orderId}&amount=${amount}`;
      window.location.href = juiceShopUrl;
    } else {
      window.location.href = redirectUrl;
    }
  };

  const handleStay = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* WhoopsPay Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">WhoopsPay</h1>
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-32 mx-auto"></div>
        </div>

        <Card className="bg-slate-700 border border-slate-600 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                {isApproved ? (
                  <CheckCircle className="relative h-20 w-20 text-yellow-400" />
                ) : (
                  <XCircle className="relative h-20 w-20 text-red-400" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-yellow-400 mb-3">
              {isApproved ? t('paymentApproved') : t('paymentRejected')}
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              {isApproved 
                ? t('approvedDescription') 
                : t('rejectedDescription')
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Transaction Details */}
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
              <h3 className="text-yellow-400 font-semibold text-lg mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">{t('orderId')}:</span>
                  <span className="text-yellow-400 font-mono text-sm bg-slate-600 px-3 py-1 rounded">{orderId}</span>
                </div>
                {amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Amount:</span>
                    <span className="text-yellow-400 font-bold text-xl">¤{amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">{t('service')}:</span>
                  <span className="text-yellow-400 font-semibold">
                    {returnTo === 'juice-shop' ? 'OWASP Juice Shop' : returnTo}
                  </span>
                </div>
              </div>
            </div>

            {/* Redirect Information */}
            {isExternal && redirectUrl && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <ExternalLink className="h-4 w-4" />
                  <span>{t('redirectingTo')}</span>
                </div>
                
                <div className="bg-slate-800 border border-slate-600 rounded p-3 text-xs font-mono text-gray-400 break-all max-h-16 overflow-y-auto">
                  {redirectUrl}
                </div>

                {countdown > 0 && !redirecting && (
                  <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-yellow-400">
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">
                        {t('redirectingIn')} <span className="font-bold">{countdown}</span> {t('seconds')}
                      </span>
                    </div>
                  </div>
                )}

                {redirecting && (
                  <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-yellow-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-medium">{t('redirecting')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleStay}
                variant="outline" 
                className="flex-1 border border-gray-500 text-gray-300 hover:bg-slate-600 bg-gray-600/30 h-10 font-medium"
              >
                {t('stayHere')}
              </Button>
              {isExternal && redirectUrl && !redirecting && (
                <Button 
                  onClick={handleManualRedirect}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-medium h-10"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('redirectNow')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">Powered by WhoopsPay Security Platform</p>
        </div>
      </div>
    </div>
  );
}