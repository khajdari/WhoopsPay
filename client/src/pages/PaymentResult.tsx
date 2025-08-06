import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowLeft, ShoppingCart } from "lucide-react";

interface PaymentResultData {
  status: 'approved' | 'rejected' | 'pending' | 'failed';
  orderId?: string;
  amount?: string;
  error?: string;
}

export default function PaymentResult() {
  const [location, navigate] = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null);

  useEffect(() => {
    // Parse URL parameters to get payment result
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') as PaymentResultData['status'];
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');
    const error = urlParams.get('error');

    if (status) {
      setPaymentData({
        status,
        orderId: orderId || undefined,
        amount: amount || undefined,
        error: error || undefined
      });
    } else {
      // If no status parameter, assume failed payment
      setPaymentData({
        status: 'failed',
        error: 'Invalid payment result'
      });
    }
  }, [location]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Loading Payment Result...</h2>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (paymentData.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          buttonText: 'Continue Shopping',
          buttonVariant: 'default' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Payment Declined',
          message: 'The payment was declined by the user.',
          buttonText: 'Try Again',
          buttonVariant: 'destructive' as const
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Payment Pending',
          message: 'Your payment is being processed.',
          buttonText: 'Back to Shop',
          buttonVariant: 'secondary' as const
        };
      default:
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Payment Failed',
          message: paymentData.error || 'An error occurred while processing your payment.',
          buttonText: 'Try Again',
          buttonVariant: 'destructive' as const
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleBackToShop = () => {
    // Navigate back to basket or main shop
    navigate('/basket');
  };

  const handleTryAgain = () => {
    // Navigate back to checkout
    navigate('/basket#/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className={`p-8 max-w-lg w-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
        <div className="text-center">
          {/* Status Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}>
            <StatusIcon className={`h-12 w-12 ${statusConfig.color}`} />
          </div>

          {/* Title and Message */}
          <h1 className={`text-2xl font-bold mb-3 ${statusConfig.color}`}>
            {statusConfig.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusConfig.message}
          </p>

          {/* Order Details */}
          {paymentData.orderId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-medium">{paymentData.orderId}</span>
                </div>
                {paymentData.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium">¤{paymentData.amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium capitalize ${statusConfig.color}`}>
                    {paymentData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentData.status === 'approved' ? (
              <Button
                onClick={handleBackToShop}
                variant={statusConfig.buttonVariant}
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {statusConfig.buttonText}
              </Button>
            ) : (
              <Button
                onClick={handleTryAgain}
                variant={statusConfig.buttonVariant}
                size="lg"
                className="w-full"
              >
                {statusConfig.buttonText}
              </Button>
            )}
            
            <Button
              onClick={handleBackToShop}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Basket
            </Button>
          </div>

          {/* Additional Information */}
          {paymentData.status === 'approved' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Payment processed via WhoopsPay</strong><br />
                Your payment has been securely processed through our integrated payment system.
                You should receive a confirmation email shortly.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}