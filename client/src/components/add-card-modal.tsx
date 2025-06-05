/**
 * Add Credit Card Modal - Payment method creation interface
 * 
 * Modal component for adding new credit card payment methods including:
 * - Card number input with validation
 * - Cardholder name and bank information
 * - Expiry date and CVV security fields
 * - Real-time form validation and submission
 * - Integration with payment method management system
 * 
 * Educational Security Features:
 * - Demonstrates client-side payment data handling
 * - Shows form validation patterns for sensitive data
 * - Includes proper error handling for payment operations
 * 
 * VULNERABILITY NOTE: Payment card data may be transmitted without
 * proper encryption for educational security training purposes.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard } from "lucide-react";

/**
 * AddCardModalProps Interface - Component properties
 * 
 * @property onClose - Callback function to close the modal
 */
interface AddCardModalProps {
  onClose: () => void;
}

/**
 * AddCardModal Component - Credit card addition interface
 * 
 * Modal component that handles the complete workflow for adding
 * new credit card payment methods to user accounts. Features include:
 * - Form state management for card details
 * - Real-time validation and error handling
 * - Server communication for card storage
 * - Cache invalidation for immediate UI updates
 * - Toast notifications for user feedback
 */
export function AddCardModal({ onClose }: AddCardModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const addCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add card");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card added successfully!",
        description: "Your new card has been added to your account",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments", user?.id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16);
    
    // Add spaces every 4 digits
    const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
    
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !bankName || !expiryDate || !cvv) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // VULNERABLE: No client-side validation of card details
    addCardMutation.mutate({
      userId: user?.id,
      type: "card",
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      cardName,
      bankName,
      expiryDate,
      cvv,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Add Credit or Debit Card
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="bankName">Issuing Bank</Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Chase Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              className="paypal-btn-primary flex-1"
              disabled={addCardMutation.isPending}
            >
              {addCardMutation.isPending ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}