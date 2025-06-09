import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function ExternalRedirect() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status'); // 'approved' or 'rejected'
  const orderId = urlParams.get('orderId');
  const amount = urlParams.get('amount');
  const returnTo = urlParams.get('returnTo') || 'juice-shop';
  const redirectUrl = urlParams.get('url');

  const isApproved = status === 'approved';
  const isExternal = returnTo !== 'internal';

  useEffect(() => {
    if (!isExternal || !redirectUrl) {
      // If not external or no redirect URL, go back to dashboard
      setTimeout(() => {
        setLocation('/');
      }, 3000);
      return;
    }

    // Start countdown for external redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExternal, redirectUrl, setLocation]);

  const handleRedirect = () => {
    setRedirecting(true);
    if (redirectUrl) {
      // For Juice Shop, we'll simulate the redirect since localhost:3000 might not be running
      // In production, this would redirect to the actual external service
      if (redirectUrl.includes('localhost:3000')) {
        // Simulate Juice Shop redirect
        setTimeout(() => {
          alert(`Redirecting to Juice Shop...\nOrder: ${orderId}\nStatus: ${status}\nAmount: $${amount}\n\nNote: Juice Shop is not running on localhost:3000`);
          setLocation('/');
        }, 1000);
      } else {
        window.location.href = redirectUrl;
      }
    } else {
      setLocation('/');
    }
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  const handleStay = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* WhoopsPay Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">WhoopsPay</h1>
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-32 mx-auto"></div>
        </div>

        <Card className="bg-gray-900 border-2 border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
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
            <div className="bg-black/50 border border-yellow-400/20 rounded-xl p-6 space-y-4">
              <h3 className="text-yellow-400 font-semibold text-lg mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('orderId')}:</span>
                  <span className="text-yellow-400 font-mono text-sm bg-yellow-400/10 px-3 py-1 rounded-lg">{orderId}</span>
                </div>
                {amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Amount:</span>
                    <span className="text-yellow-400 font-bold text-xl">${amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('service')}:</span>
                  <span className="text-yellow-400 font-semibold">
                    {returnTo === 'juice-shop' ? 'OWASP Juice Shop' : returnTo}
                  </span>
                </div>
              </div>
            </div>

            {/* Redirect Information */}
            {isExternal && redirectUrl && (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <ExternalLink className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium">{t('redirectingTo')}</span>
                </div>
                
                <div className="bg-black/70 border border-yellow-400/20 rounded-lg p-4 text-xs font-mono text-gray-400 break-all max-h-20 overflow-y-auto">
                  {redirectUrl}
                </div>

                {countdown > 0 && !redirecting && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-3 text-yellow-400">
                      <ArrowRight className="h-5 w-5" />
                      <span className="font-semibold text-lg">
                        {t('redirectingIn')} <span className="text-2xl font-bold">{countdown}</span> {t('seconds')}
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-black/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {redirecting && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-3 text-yellow-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="font-semibold text-lg">{t('redirecting')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button 
                onClick={handleStay}
                variant="outline" 
                className="flex-1 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 h-12 font-semibold"
              >
                {t('stayHere')}
              </Button>
              {isExternal && redirectUrl && !redirecting && (
                <Button 
                  onClick={handleManualRedirect}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold h-12 shadow-lg shadow-yellow-400/25"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
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