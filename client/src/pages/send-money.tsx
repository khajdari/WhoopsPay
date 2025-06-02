import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Send, DollarSign, CreditCard, Banknote } from "lucide-react";
import { useLocation } from "wouter";

export default function SendMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Send Money
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendPaymentMethod, setSendPaymentMethod] = useState("");
  
  // Request Money
  const [requestFrom, setRequestFrom] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");
  
  // Add Money
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("");
  
  // Withdraw Money
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState("");

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      toast({
        title: "Money sent successfully!",
        description: `$${sendAmount} has been sent to ${sendRecipient}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setSendRecipient("");
      setSendAmount("");
      setSendNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/money-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Money request sent!",
        description: `Request for $${requestAmount} sent to ${requestFrom}`,
      });
      setRequestFrom("");
      setRequestAmount("");
      setRequestNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/add-money", data);
    },
    onSuccess: () => {
      toast({
        title: "Money added successfully!",
        description: `$${addAmount} added to your account`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      setAddAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/withdraw-money", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal initiated!",
        description: `$${withdrawAmount} withdrawal request submitted`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      setWithdrawAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in recipient and amount",
        variant: "destructive",
      });
      return;
    }
    


    // VULNERABLE: No input validation or sanitization
    // This allows for potential XSS attacks through the note field
    // and SQL injection through the recipient field
    sendMoneyMutation.mutate({
      fromUserId: user?.id,
      toUserId: recipient, // VULNERABLE: Direct user input without validation
      amount: parseFloat(amount),
      description: note, // VULNERABLE: Stored without sanitization (XSS risk)
      status: "completed",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mobile-nav-spacing">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-600">Send money to friends and family</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient - VULNERABLE to injection attacks */}
              <div>
                <Label htmlFor="recipient">Send to</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="Email, phone number, or user ID"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the recipient's email, phone, or user ID
                </p>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Note - VULNERABLE to XSS attacks */}
              <div>
                <Label htmlFor="note">What's this for? (Optional)</Label>
                <Input
                  id="note"
                  type="text"
                  placeholder="Add a note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This note will be visible to the recipient
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment-method">Payment method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance">PayPal Balance</SelectItem>
                    <SelectItem value="bank">Bank Account ****1234</SelectItem>
                    <SelectItem value="card">Visa ****5678</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-paypal-blue hover:bg-paypal-darkblue text-white"
                  disabled={sendMoneyMutation.isPending}
                >
                  {sendMoneyMutation.isPending ? "Sending..." : "Send Money"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Vulnerability Warning (for educational purposes) */}
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-sm">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Educational Notice</h3>
                <p className="text-sm text-red-700 mt-1">
                  This form contains intentional security vulnerabilities including:
                  lack of input validation, XSS potential in the note field, and 
                  insufficient authorization checks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
