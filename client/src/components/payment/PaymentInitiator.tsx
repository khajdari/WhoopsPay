import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, DollarSign } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface PaymentInitiatorProps {
  requestId: number;
  amount: number;
  description: string;
  externalSource: string;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentInitiator({
  requestId,
  amount,
  description,
  externalSource,
  orderId,
  onSuccess,
  onError
}: PaymentInitiatorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/requests/${requestId}/approve`, 'POST');
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pending-requests'] });
      
      if (data.redirect && data.redirectUrl) {
        // Redirect to the RedirectHandler component
        window.location.href = data.redirectUrl;
      }
      
      toast({
        title: t('paymentApproved'),
        description: t('approvedDescription'),
      });
      
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      onError?.(error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/requests/${requestId}/reject`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pending-requests'] });
      toast({
        title: t('paymentRejected'),
        description: t('rejectedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ExternalLink className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-400">
            {externalSource === 'juice-shop' ? 'OWASP Juice Shop' : externalSource}
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{t('pending')}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">{t('orderId')}:</span>
          <span className="text-yellow-400 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
            {orderId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">{t('amount')}:</span>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-lg">{amount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-gray-300">{t('description')}:</span>
          <p className="text-gray-400 text-sm bg-slate-700 p-3 rounded">
            {description}
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          onClick={() => rejectMutation.mutate()}
          disabled={rejectMutation.isPending || approveMutation.isPending}
          variant="outline"
          className="flex-1 border border-red-600 text-red-400 hover:bg-red-600/10"
        >
          {rejectMutation.isPending ? t('rejecting') : t('reject')}
        </Button>
        
        <Button
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending || rejectMutation.isPending}
          className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-medium"
        >
          {approveMutation.isPending ? t('approving') : t('approve')}
        </Button>
      </div>
    </div>
  );
}