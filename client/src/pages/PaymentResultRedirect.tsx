import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PaymentResultRedirect() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const orderId = urlParams.get('orderId');
  const amount = urlParams.get('amount');
  const returnTo = urlParams.get('returnTo');

  const juiceShopUrl = `http://localhost:3000/basket#/order-completion?status=approved&orderId=${orderId}&amount=${amount}`;

  useEffect(() => {
    if (returnTo === 'juice-shop') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = juiceShopUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [returnTo, juiceShopUrl]);

  const handleRedirectNow = () => {
    window.location.href = juiceShopUrl;
  };

  const handleBackToDashboard = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-yellow-400 border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-400" />
          </div>
          <CardTitle className="text-2xl text-yellow-400">
            Payment Approved!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-300">
              Your payment has been successfully processed.
            </p>
            <div className="bg-gray-800 p-4 rounded border border-yellow-400/30">
              <p className="text-sm text-gray-400">Order ID:</p>
              <p className="text-yellow-400 font-mono">{orderId}</p>
              <p className="text-sm text-gray-400 mt-2">Amount:</p>
              <p className="text-yellow-400 font-bold">${amount}</p>
            </div>
          </div>

          {returnTo === 'juice-shop' && (
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-400/50 p-4 rounded">
                <div className="flex items-center justify-center mb-2">
                  <ExternalLink className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-blue-400 font-semibold">Returning to Juice Shop</span>
                </div>
                <p className="text-sm text-gray-300">
                  Redirecting automatically in {countdown} seconds...
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleRedirectNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Juice Shop Now
                </Button>
                <Button 
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  Back to WhoopsPay Dashboard
                </Button>
              </div>
            </div>
          )}

          {returnTo !== 'juice-shop' && (
            <Button 
              onClick={handleBackToDashboard}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              Back to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}