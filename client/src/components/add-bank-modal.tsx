import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { University } from "lucide-react";

interface AddBankModalProps {
  onClose: () => void;
}

export function AddBankModal({ onClose }: AddBankModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const addBankMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add bank account");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bank account added successfully!",
        description: "Your new bank account has been added to your account",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add bank account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 17) { // Max account number length
      setAccountNumber(value);
    }
  };

  const handleRoutingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) { // Routing numbers are 9 digits
      setRoutingNumber(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName || !accountNumber || !routingNumber || !accountHolderName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (routingNumber.length !== 9) {
      toast({
        title: "Invalid routing number",
        description: "Routing number must be 9 digits",
        variant: "destructive",
      });
      return;
    }

    // VULNERABLE: No client-side validation of bank details
    addBankMutation.mutate({
      userId: user?.id,
      type: "bank",
      bankName,
      accountNumber,
      routingNumber,
      accountHolderName,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <University className="w-5 h-5 mr-2" />
            Add Bank Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Chase Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="John Doe"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              type="text"
              placeholder="123456789"
              value={routingNumber}
              onChange={handleRoutingNumberChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="1234567890"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your bank information will be encrypted and stored securely. 
              We will never share your banking details with third parties.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-paypal-blue text-white"
              disabled={addBankMutation.isPending}
            >
              {addBankMutation.isPending ? "Adding..." : "Add Bank Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}