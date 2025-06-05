import { useEffect, useState } from "react";
import { useLocation } from "wouter";

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

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to external payment page with parameters
          const redirectUrl = `/external-payment/${transactionId}?amount=${amount}&description=${encodeURIComponent(description || '')}&returnUrl=${encodeURIComponent(returnUrl || '')}&cancelUrl=${encodeURIComponent(cancelUrl || '')}`;
          setLocation(redirectUrl);
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