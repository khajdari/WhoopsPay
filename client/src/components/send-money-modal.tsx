import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useNotifications } from "@/hooks/useNotifications";
import { X } from "lucide-react";

interface SendMoneyModalProps {
  onClose: () => void;
}

export function SendMoneyModal({ onClose }: SendMoneyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addTransactionNotification } = useNotifications();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionType, setTransactionType] = useState("transfer");

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("In mutation function, data received:", JSON.stringify(data, null, 2));
      console.log("Data has type field:", 'type' in data);
      console.log("Type value:", data.type);
      const result = await apiRequest("POST", "/api/transactions", data);
      console.log("Mutation result:", result);
      return result;
    },
    onSuccess: () => {
      const isRequest = transactionType === "request";
      toast({
        title: isRequest ? "Money request sent!" : "Money sent successfully!",
        description: isRequest 
          ? `Request for $${amount} has been sent to ${recipient}` 
          : `$${amount} has been sent to ${recipient}`,
      });
      
      // Add live notification only for direct transfers
      if (!isRequest) {
        addTransactionNotification('sent', amount, recipient);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: transactionType === "request" ? "Failed to send request" : "Failed to send money",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // VULNERABLE: No input validation or sanitization
    const isRequest = transactionType === "request";
    
    if (isRequest) {
      // Money request - send with explicit type and pending status
      sendMoneyMutation.mutate({
        fromUserId: user?.id,
        toUserId: recipient,
        amount: parseFloat(amount),
        description: `Money request: ${note}`,
        type: "request",
        status: "pending"
      });
    } else {
      // Direct transfer - send with transfer type and completed status
      sendMoneyMutation.mutate({
        fromUserId: user?.id,
        toUserId: recipient,
        amount: parseFloat(amount),
        description: note,
        type: "transfer",
        status: "completed"
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Send Money</SelectItem>
                <SelectItem value="request">Request Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient - VULNERABLE */}
          <div>
            <Label htmlFor="recipient">{transactionType === "request" ? "Request from" : "Send to"}</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Email or phone number"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
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

          {/* Note - VULNERABLE to XSS */}
          <div>
            <Label htmlFor="note">What's this for?</Label>
            <Input
              id="note"
              type="text"
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
                <SelectItem value="bank">Chase Bank ****1234</SelectItem>
                <SelectItem value="card">Visa ****5678</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-paypwned-blue hover:bg-paypwned-darkblue text-white"
              disabled={sendMoneyMutation.isPending}
            >
              {sendMoneyMutation.isPending ? "Sending..." : "Send Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
