import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentProcessing() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    const amount = urlParams.get('amount');
    const description = urlParams.get('description');
    const returnUrl = urlParams.get('returnUrl');
    const cancelUrl = urlParams.get('cancelUrl');

    // Create external transaction in database
    const createTransaction = async () => {
      try {
        const response = await fetch("/api/external/payment/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(amount || '0'),
            orderId: transactionId,
            source: 'juice-shop',
            description: description || 'External payment',
            returnUrl: returnUrl || '',
            cancelUrl: cancelUrl || ''
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create transaction');
        }
        
        const result = await response.json();
        console.log('Transaction created:', result);
        
        // Store the actual transaction ID from the response
        if (result.transactionId) {
          sessionStorage.setItem('actualTransactionId', result.transactionId.toString());
        }
      } catch (error) {
        console.error('Failed to create external transaction:', error);
      }
    };

    if (transactionId && amount) {
      createTransaction();
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use the actual transaction ID from the server response, fallback to original
          const actualTransactionId = sessionStorage.getItem('actualTransactionId') || transactionId;
          setLocation(`/external-payment/${actualTransactionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h1>
          <p className="text-gray-600">Securely redirecting you to WhoopsPay...</p>
        </div>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">{countdown}</div>
          <p className="text-sm text-gray-500">Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Please wait while we prepare your secure payment session...
          </p>
        </div>
      </div>
    </div>
  );
}