import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useLocation } from 'wouter';

interface ConfirmationPageProps {
  status: 'success' | 'failed';
  transactionId: string;
  amount: number;
  description: string;
  externalSource?: string;
  orderId?: string;
  timestamp: number;
  securityScore?: number;
  onDownloadReceipt?: () => void;
  onReturnToDashboard?: () => void;
}

export function ConfirmationPage({
  status,
  transactionId,
  amount,
  description,
  externalSource,
  orderId,
  timestamp,
  securityScore,
  onDownloadReceipt,
  onReturnToDashboard
}: ConfirmationPageProps) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const isSuccess = status === 'success';
  const formattedDate = new Date(timestamp).toLocaleString();

  const handleReturnToDashboard = () => {
    if (onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      setLocation('/dashboard');
    }
  };

  const handleDownloadReceipt = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt();
    } else {
      // Generate and download receipt
      const receiptData = {
        transactionId,
        amount,
        description,
        externalSource,
        orderId,
        timestamp: formattedDate,
        status,
        securityScore
      };
      
      const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* WhoopsPay Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">WhoopsPay</h1>
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-32 mx-auto"></div>
        </div>

        <Card className="bg-slate-700 border border-slate-600 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`absolute inset-0 ${isSuccess ? 'bg-green-400/20' : 'bg-red-400/20'} rounded-full blur-xl animate-pulse`}></div>
                {isSuccess ? (
                  <CheckCircle className="relative h-24 w-24 text-green-400" />
                ) : (
                  <XCircle className="relative h-24 w-24 text-red-400" />
                )}
              </div>
            </div>
            <CardTitle className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
              {isSuccess ? t('transactionComplete') : t('transactionFailed')}
            </CardTitle>
            <p className="text-gray-300 text-lg">
              {isSuccess 
                ? t('transactionProcessedSuccessfully')
                : t('transactionCouldNotBeCompleted')
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Transaction Summary */}
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
              <h3 className="text-yellow-400 font-semibold text-lg mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                Transaction Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Transaction ID:</span>
                    <span className="text-yellow-400 font-mono text-sm">{transactionId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className={`font-bold text-xl ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                      ${amount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`font-semibold capitalize ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                      {status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Order ID:</span>
                      <span className="text-yellow-400 font-mono text-sm">{orderId}</span>
                    </div>
                  )}
                  
                  {externalSource && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Service:</span>
                      <span className="text-yellow-400">
                        {externalSource === 'juice-shop' ? 'OWASP Juice Shop' : externalSource}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Date & Time:</span>
                    <span className="text-gray-400 text-sm">{formattedDate}</span>
                  </div>
                  
                  {securityScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Security Score:</span>
                      <span className={`font-bold ${securityScore >= 90 ? 'text-green-400' : securityScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {securityScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex justify-between">
                  <span className="text-gray-300">Description:</span>
                </div>
                <p className="text-gray-400 text-sm mt-1 bg-slate-700 p-3 rounded">
                  {description}
                </p>
              </div>
            </div>

            {/* Security Information */}
            {isSuccess && securityScore && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  Security Verification
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">This transaction has been verified and secured</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleReturnToDashboard}
                variant="outline"
                className="flex-1 border border-gray-500 text-gray-300 hover:bg-slate-600 bg-gray-600/30 h-12 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              
              <Button
                onClick={handleDownloadReceipt}
                className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-medium h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              
              {externalSource && isSuccess && (
                <Button
                  onClick={() => window.open(`/transactions/${transactionId}`, '_blank')}
                  variant="outline"
                  className="flex-1 border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 h-12 font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">Transaction secured by WhoopsPay Security Platform</p>
          <p className="text-xs mt-1">
            For support, contact security@whoopspay.com
          </p>
        </div>
      </div>
    </div>
  );
}