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
    <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-yellow-400/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isApproved ? (
              <CheckCircle className="h-16 w-16 text-green-400" />
            ) : (
              <XCircle className="h-16 w-16 text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl text-yellow-400">
            {isApproved ? t('paymentApproved') : t('paymentRejected')}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isApproved 
              ? t('approvedDescription') 
              : t('rejectedDescription')
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">{t('orderId')}:</span>
              <span className="text-yellow-400 font-mono">{orderId}</span>
            </div>
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-300">Amount:</span>
                <span className="text-yellow-400 font-bold">${amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-300">{t('service')}:</span>
              <span className="text-yellow-400">
                {returnTo === 'juice-shop' ? 'OWASP Juice Shop' : returnTo}
              </span>
            </div>
          </div>

          {/* Redirect Information */}
          {isExternal && redirectUrl && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <ExternalLink className="h-4 w-4" />
                <span>{t('redirectingTo')}</span>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3 text-xs font-mono text-gray-400 break-all">
                {redirectUrl}
              </div>

              {countdown > 0 && !redirecting && (
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <ArrowRight className="h-4 w-4" />
                  <span>{t('redirectingIn')} {countdown} {t('seconds')}</span>
                </div>
              )}

              {redirecting && (
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('redirecting')}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleStay}
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {t('stayHere')}
            </Button>
            {isExternal && redirectUrl && !redirecting && (
              <Button 
                onClick={handleManualRedirect}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-gray-900"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('redirectNow')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}