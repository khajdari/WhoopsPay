import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';

interface CallbackListenerProps {
  transactionId?: string;
  onPaymentVerified?: (result: PaymentVerificationResult) => void;
  onError?: (error: Error) => void;
}

interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  externalReference?: string;
  timestamp: number;
}

export function CallbackListener({
  transactionId,
  onPaymentVerified,
  onError
}: CallbackListenerProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 30; // 30 seconds with 1-second intervals

  const { data: verificationResult, error, isLoading } = useQuery({
    queryKey: ['/api/payment/verify', transactionId],
    enabled: !!transactionId && isListening && attempts < maxAttempts,
    refetchInterval: 1000, // Poll every second
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setIsListening(false);
      const timeoutError = new Error('Payment verification timeout');
      onError?.(timeoutError);
    } else if (isListening) {
      const timer = setTimeout(() => {
        setAttempts(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [attempts, isListening, maxAttempts, onError]);

  useEffect(() => {
    if (verificationResult) {
      setIsListening(false);
      onPaymentVerified?.(verificationResult);
    }
  }, [verificationResult, onPaymentVerified]);

  useEffect(() => {
    if (error) {
      setIsListening(false);
      onError?.(error as Error);
    }
  }, [error, onError]);

  // Listen for external payment callbacks via postMessage
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Validate origin for security
      const allowedOrigins = ['http://localhost:3000', 'https://juice-shop.herokuapp.com'];
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data?.type === 'PAYMENT_CALLBACK') {
        const { success, transactionId: callbackTxId, status, amount } = event.data;
        
        if (callbackTxId === transactionId) {
          const result: PaymentVerificationResult = {
            success,
            transactionId: callbackTxId,
            amount,
            status,
            externalReference: event.data.externalReference,
            timestamp: Date.now()
          };
          
          setIsListening(false);
          onPaymentVerified?.(result);
        }
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [transactionId, onPaymentVerified]);

  if (!isListening) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border border-slate-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-3">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
              <span className="text-gray-300">
                {t('verifyingPayment')} ({attempts}/{maxAttempts})
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-300">
                {t('waitingForCallback')}
              </span>
            </>
          )}
        </div>
        
        <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(attempts / maxAttempts) * 100}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-400 text-center mt-2">
          {t('listeningForPaymentConfirmation')}
        </p>
      </CardContent>
    </Card>
  );
}