/**
 * External Payment Redirect Page - Cross-platform payment processing handler
 * 
 * Intermediate page that handles payment requests from external applications:
 * - Captures payment parameters from URL query strings
 * - Displays countdown timer for user experience
 * - Stores payment data in session storage for persistence
 * - Redirects to authentication flow for payment processing
 * - Provides visual feedback during transition
 * 
 * Educational Security Features:
 * - Demonstrates cross-platform payment integration
 * - Shows session storage usage for temporary data
 * - Includes URL parameter handling patterns
 * 
 * VULNERABILITY NOTE: May expose payment data in session storage
 * for educational security training purposes.
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, ArrowRight } from "lucide-react";

/**
 * ExternalPaymentRedirect Component - Payment transition interface
 * 
 * Handles the transition between external applications and WhoopsPay
 * payment processing. Features include:
 * - Payment parameter extraction from URL
 * - Visual countdown timer for user feedback
 * - Session data persistence for payment flow
 * - Automatic redirection to authentication
 * - Clean transition animations and icons
 */
export default function ExternalPaymentRedirect() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const description = urlParams.get('description');
    const source = urlParams.get('source');

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Create external payment in WhoopsPay system
          const externalPaymentData = {
            amount: amount || "0.89",
            description: description || "External Payment",
            source: source || "external",
            returnUrl: `${window.location.origin}/juice-shop?status=success`,
            cancelUrl: `${window.location.origin}/juice-shop?status=cancelled`
          };

          // Store data and redirect to login
          sessionStorage.setItem('externalPayment', JSON.stringify(externalPaymentData));
          window.location.href = '/login?external=true';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🥤</span>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecting to WhoopsPay
          </h1>
          
          <p className="text-gray-600 mb-6">
            You are being securely redirected to WhoopsPay to complete your payment from Juice Shop.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-blue-900">WhoopsPay</span>
            </div>
            <p className="text-sm text-blue-700">
              Secure Payment Processing
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl font-bold text-blue-600">{countdown}</span>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            <p>If you are not redirected automatically,</p>
            <button 
              onClick={() => window.location.href = '/login?external=true'}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              click here to continue
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}