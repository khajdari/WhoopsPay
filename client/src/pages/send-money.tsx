/**
 * Send Money Page - Comprehensive financial transaction interface
 * 
 * Multi-functional money management page providing:
 * - Send money to other users with payment method selection
 * - Request money from other users with notification system
 * - Add money to account using various funding sources
 * - Real-time transaction processing and status updates
 * - Payment method integration and management
 * 
 * Educational Security Features:
 * - Demonstrates financial transaction processing
 * - Shows payment method validation patterns
 * - Includes transaction notification systems
 * 
 * VULNERABILITY NOTE: May contain intentional transaction security
 * weaknesses for educational security training purposes.
 */
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import type { PaymentMethod } from "@shared/schema";
import { useNotifications } from "@/hooks/useNotifications";

/**
 * SendMoney Component - Financial transaction management interface
 * 
 * Comprehensive money management page with tabbed interface for different
 * transaction types. Features include:
 * - Send money with recipient selection and payment methods
 * - Request money with notification and tracking system
 * - Add money using various funding sources
 * - Real-time transaction processing and validation
 * - Integration with notification and payment systems
 */
export default function SendMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("send");
  const { addTransactionNotification } = useNotifications();
  
  // Send Money
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  
  // Request Money
  const [requestFrom, setRequestFrom] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  
  // Check URL parameters to set initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'request') {
      setActiveTab('request');
    } else {
      setActiveTab('send');
    }
  }, []);
  const [requestNote, setRequestNote] = useState("");
  
  // Add Money
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("");
  
  // Withdraw Money
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState("");

  // Fetch user's payment methods
  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/payments?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/transactions", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Money sent successfully!",
        description: `$${sendAmount} has been sent to ${sendRecipient}`,
      });
      // Add live notification
      addTransactionNotification('sent', sendAmount, sendRecipient);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
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
      return await apiRequest("/api/transactions", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Request sent successfully!",
        description: `$${requestAmount} has been requested from ${requestFrom}`,
      });
      // Add live notification for request
      addTransactionNotification('sent', requestAmount, `request from ${requestFrom}`);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      setRequestFrom("");
      setRequestAmount("");
      setRequestNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      // VULNERABLE: No authentication check on add money endpoint
      return await apiRequest("POST", "/api/add-money", data);
    },
    onSuccess: () => {
      toast({
        title: "Money added successfully!",
        description: `$${addAmount} added to your account`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      setAddAmount("");
      setAddSource("");
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
      setWithdrawDestination("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sendRecipient || !sendAmount) {
      toast({
        title: "Missing fields",
        description: "Please fill in recipient and amount",
        variant: "destructive",
      });
      return;
    }

    // VULNERABLE: No input validation or sanitization
    sendMoneyMutation.mutate({
      fromUserId: user?.id,
      toUserId: sendRecipient,
      amount: parseFloat(sendAmount),
      description: sendNote,
      status: "completed",
    });
  };

  const handleRequestMoney = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestFrom || !requestAmount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create a money request transaction
    requestMoneyMutation.mutate({
      fromUserId: requestFrom,
      toUserId: user?.id,
      amount: parseFloat(requestAmount),
      description: `Money request: ${requestNote}`,
      status: "pending",
    });
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addAmount || !addSource) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addMoneyMutation.mutate({
      userId: user?.id,
      amount: parseFloat(addAmount),
      source: addSource,
    });
  };

  const handleWithdrawMoney = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawAmount || !withdrawDestination) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    withdrawMoneyMutation.mutate({
      userId: user?.id,
      amount: parseFloat(withdrawAmount),
      destination: withdrawDestination,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Money Center</h1>
          <p className="text-gray-600 mt-2">
            Send, request, add, or withdraw money
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Request
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Add Money
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          {/* Send Money Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Money</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMoney} className="space-y-6">
                  <div>
                    <Label htmlFor="send-recipient">Send to</Label>
                    <Input
                      id="send-recipient"
                      type="text"
                      placeholder="Email, phone number, or user ID"
                      value={sendRecipient}
                      onChange={(e) => setSendRecipient(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Try: jdoe, mdoe, or edoe
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="send-amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        id="send-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="send-note">Note (Optional)</Label>
                    <Input
                      id="send-note"
                      type="text"
                      placeholder="What's this for?"
                      value={sendNote}
                      onChange={(e) => setSendNote(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                    disabled={sendMoneyMutation.isPending}
                  >
                    {sendMoneyMutation.isPending ? "Sending..." : "Send Money"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Request Money Tab */}
          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>Request Money</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestMoney} className="space-y-6">
                  <div>
                    <Label htmlFor="request-from">Request from</Label>
                    <Input
                      id="request-from"
                      type="text"
                      placeholder="Email, phone number, or user ID"
                      value={requestFrom}
                      onChange={(e) => setRequestFrom(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Try: jdoe, mdoe, or edoe
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="request-amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        id="request-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="request-note">Note (Optional)</Label>
                    <Input
                      id="request-note"
                      type="text"
                      placeholder="What's this for?"
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                    disabled={requestMoneyMutation.isPending}
                  >
                    {requestMoneyMutation.isPending ? "Requesting..." : "Request Money"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Money Tab */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Money</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMoney} className="space-y-6">
                  <div>
                    <Label htmlFor="add-amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        id="add-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="add-source">Funding Source</Label>
                    <Select value={addSource} onValueChange={setAddSource} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding source" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.type === 'card' ? (
                              `${method.cardName} - **** ${method.cardNumber?.slice(-4)} (${method.bankName})`
                            ) : (
                              `${method.bankName} - ****${method.accountNumber?.slice(-4)}`
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                    disabled={addMoneyMutation.isPending}
                  >
                    {addMoneyMutation.isPending ? "Adding..." : "Add Money"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Money Tab */}
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Money</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdrawMoney} className="space-y-6">
                  <div>
                    <Label htmlFor="withdraw-amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="withdraw-destination">Withdraw to</Label>
                    <Select value={withdrawDestination} onValueChange={setWithdrawDestination} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.type === 'card' ? (
                              `${method.cardName} - **** ${method.cardNumber?.slice(-4)} (${method.bankName})`
                            ) : (
                              `${method.bankName} - ****${method.accountNumber?.slice(-4)}`
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-whoopspay-blue hover:bg-whoopspay-darkblue text-white"
                    disabled={withdrawMoneyMutation.isPending}
                  >
                    {withdrawMoneyMutation.isPending ? "Processing..." : "Withdraw Money"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}