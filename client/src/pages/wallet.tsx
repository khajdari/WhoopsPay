import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/payments", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/payments?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
    enabled: !!user,
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments", user?.id] });
      toast({
        title: "Payment method removed",
        description: "Your payment method has been successfully removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  const handleDeletePaymentMethod = (id: number) => {
    deletePaymentMethodMutation.mutate(id);
  };

  const balance = (userProfile as any)?.balance || "0.00";

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
                WhoopsPay Balance
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
                  className="bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                  onClick={() => setShowAddCardModal(true)}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Add Card
                </Button>
                <Button 
                  size="sm" 
                  className="bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
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
                    id={method.id}
                    type={method.type}
                    cardNumber={method.cardNumber}
                    cardName={method.cardName}
                    bankName={method.bankName}
                    accountNumber={method.accountNumber}
                    iban={method.iban}
                    showDelete={true}
                    onDelete={handleDeletePaymentMethod}
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
