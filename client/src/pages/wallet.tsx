import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { AddCardModal } from "@/components/add-card-modal";
import { AddBankModal } from "@/components/add-bank-modal";
import { PaymentCard } from "@/components/payment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet as WalletIcon, CreditCard, University, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Wallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payment-methods", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/payment-methods?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
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
                  <Button size="sm" className="bg-paypal-blue hover:bg-paypal-darkblue text-white">
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
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-paypal-blue text-white"
                  onClick={() => setShowAddCardModal(true)}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Add Card
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAddBankModal(true)}
                >
                  <University className="w-4 h-4 mr-1" />
                  Add Bank
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethodsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method: any) => (
                  <PaymentCard
                    key={method.id}
                    type={method.type}
                    cardNumber={method.cardNumber}
                    cardName={method.cardName}
                    bankName={method.bankName}
                    accountNumber={method.accountNumber}
                  />
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
      
      {showAddCardModal && (
        <AddCardModal onClose={() => setShowAddCardModal(false)} />
      )}
      {showAddBankModal && (
        <AddBankModal onClose={() => setShowAddBankModal(false)} />
      )}
    </div>
  );
}
