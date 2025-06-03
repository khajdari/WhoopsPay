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

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      toast({
        title: "Money sent successfully!",
        description: `$${amount} has been sent to ${recipient}`,
      });
      // Add live notification
      addTransactionNotification('sent', amount, recipient);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send money",
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
    sendMoneyMutation.mutate({
      fromUserId: user?.id,
      toUserId: recipient, // VULNERABLE: Direct user input
      amount: parseFloat(amount),
      description: note, // VULNERABLE: XSS potential
      status: "completed",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient - VULNERABLE */}
          <div>
            <Label htmlFor="recipient">Send to</Label>
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
