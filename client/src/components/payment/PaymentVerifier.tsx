import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';

interface PaymentVerifierProps {
  transactionId: string;
  expectedAmount: number;
  externalReference?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
}

interface VerificationResult {
  verified: boolean;
  status: 'verified' | 'failed' | 'pending' | 'mismatch';
  transactionId: string;
  actualAmount?: number;
  expectedAmount: number;
  securityScore: number;
  fraudCheck: {
    passed: boolean;
    flags: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  timestamp: number;
}

export function PaymentVerifier({
  transactionId,
  expectedAmount,
  externalReference,
  onVerificationComplete,
  onError
}: PaymentVerifierProps) {
  const { t } = useLanguage();
  const [verificationStage, setVerificationStage] = useState<'pending' | 'verifying' | 'complete'>('pending');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/payment/verify/${transactionId}`, 'POST', {
        expectedAmount,
        externalReference
      });
      return response;
    },
    onSuccess: (data: VerificationResult) => {
      setVerificationResult(data);
      setVerificationStage('complete');
      onVerificationComplete?.(data);
    },
    onError: (error) => {
      setVerificationStage('complete');
      onError?.(error);
    },
  });

  useEffect(() => {
    if (verificationStage === 'pending') {
      setVerificationStage('verifying');
      verifyMutation.mutate();
    }
  }, [verificationStage]);

  const getStatusIcon = () => {
    if (!verificationResult) {
      return <Clock className="h-8 w-8 text-yellow-400 animate-pulse" />;
    }

    switch (verificationResult.status) {
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-400" />;
      case 'mismatch':
        return <AlertTriangle className="h-8 w-8 text-orange-400" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    if (!verificationResult) return 'text-yellow-400';
    
    switch (verificationResult.status) {
      case 'verified':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'mismatch':
        return 'text-orange-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-slate-800 border border-slate-600">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Shield className="h-12 w-12 text-yellow-400" />
            <div className="absolute -top-1 -right-1">
              {getStatusIcon()}
            </div>
          </div>
        </div>
        <CardTitle className={`text-xl ${getStatusColor()}`}>
          {verificationStage === 'verifying' && t('verifyingPayment')}
          {verificationStage === 'complete' && verificationResult && (
            <>
              {verificationResult.status === 'verified' && t('paymentVerified')}
              {verificationResult.status === 'failed' && t('verificationFailed')}
              {verificationResult.status === 'mismatch' && t('amountMismatch')}
              {verificationResult.status === 'pending' && t('verificationPending')}
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Details */}
        <div className="bg-slate-700 rounded-lg p-4 space-y-3">
          <h4 className="text-yellow-400 font-semibold flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            Verification Details
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Transaction ID:</span>
              <span className="text-yellow-400 font-mono">{transactionId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Expected Amount:</span>
              <span className="text-yellow-400">${expectedAmount}</span>
            </div>
            
            {verificationResult?.actualAmount && (
              <div className="flex justify-between">
                <span className="text-gray-300">Actual Amount:</span>
                <span className={verificationResult.actualAmount === expectedAmount ? 'text-green-400' : 'text-red-400'}>
                  ${verificationResult.actualAmount}
                </span>
              </div>
            )}
            
            {externalReference && (
              <div className="flex justify-between">
                <span className="text-gray-300">External Ref:</span>
                <span className="text-gray-400 font-mono text-xs">{externalReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Analysis */}
        {verificationResult && (
          <div className="bg-slate-700 rounded-lg p-4 space-y-3">
            <h4 className="text-yellow-400 font-semibold flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              Security Analysis
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Security Score:</span>
                <span className={`font-bold ${getSecurityScoreColor(verificationResult.securityScore)}`}>
                  {verificationResult.securityScore}/100
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Risk Level:</span>
                <span className={`font-semibold capitalize ${getRiskLevelColor(verificationResult.fraudCheck.riskLevel)}`}>
                  {verificationResult.fraudCheck.riskLevel}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Fraud Check:</span>
                <span className={verificationResult.fraudCheck.passed ? 'text-green-400' : 'text-red-400'}>
                  {verificationResult.fraudCheck.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              
              {verificationResult.fraudCheck.flags.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-300 text-sm">Security Flags:</span>
                  <div className="mt-1 space-y-1">
                    {verificationResult.fraudCheck.flags.map((flag, index) => (
                      <div key={index} className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {verificationStage === 'complete' && verificationResult && (
          <div className="flex space-x-3">
            {verificationResult.status === 'verified' ? (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onVerificationComplete?.(verificationResult)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Continue
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10"
                onClick={() => onError?.(new Error('Payment verification failed'))}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Handle Error
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}