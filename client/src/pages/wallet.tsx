import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet as WalletIcon, CreditCard, University, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Wallet() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payment-methods"],
    enabled: !!user,
  });

  const balance = userProfile?.balance || "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your balance and payment methods</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <WalletIcon className="w-5 h-5 mr-2" />
                PayPal Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {showBalance ? `$${balance}` : "••••••"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Available balance</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Money
                  </Button>
                  <Button variant="outline" size="sm">
                    Withdraw
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethodsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="w-8 h-8" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method: any) => (
                  <div key={method.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {method.type === 'bank' ? (
                        <University className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {method.type === 'bank' ? 'Bank Account' : 'Credit Card'}
                      </p>
                      {/* VULNERABLE: Exposing sensitive payment data */}
                      <p className="text-sm text-gray-500">
                        {showSensitiveData 
                          ? method.accountNumber || method.cardNumber 
                          : `****${(method.accountNumber || method.cardNumber)?.slice(-4)}`
                        }
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No payment methods added</p>
                <p className="text-sm mt-1">Add a bank account or card to get started</p>
                <Button className="mt-4" size="sm">
                  Add Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensitive Data Exposure Demo */}
        {userProfile && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                ⚠️ Vulnerability Demo: Sensitive Data Exposure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">Show Sensitive Data:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {showSensitiveData ? "Hide" : "Show"}
                  </Button>
                </div>
                
                {showSensitiveData && (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">SSN:</span> {userProfile.ssn || "Not provided"}</p>
                    <p><span className="font-medium">Bank Account:</span> {userProfile.bankAccount || "Not provided"}</p>
                    <p><span className="font-medium">Credit Card:</span> {userProfile.creditCard || "Not provided"}</p>
                    <p><span className="font-medium">Raw Password:</span> {userProfile.password || "Not stored"}</p>
                  </div>
                )}
                
                <p className="text-xs text-red-600">
                  This demonstrates how sensitive data can be exposed through vulnerable API endpoints
                  without proper access controls and data masking.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
