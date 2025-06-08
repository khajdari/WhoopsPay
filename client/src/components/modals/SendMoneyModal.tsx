import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, User, DollarSign, CreditCard } from "lucide-react";
import { PaymentService } from "../../services/PaymentService";
import { WalletService, type PaymentMethod } from "../../services/WalletService";
import { FormValidator } from "../../utils/FormValidation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recipientId?: string;
}

export function SendMoneyModal({ isOpen, onClose, onSuccess, recipientId }: SendMoneyModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipient: recipientId || "",
    amount: "",
    description: "",
    paymentMethodId: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["/api/payments", user?.id],
    enabled: isOpen && !!user?.id
  });

  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet", user?.id, "balance"],
    enabled: isOpen && !!user?.id
  });

  const validator = new FormValidator({
    recipient: {
      required: true,
      minLength: 2,
      pattern: /^@?[a-zA-Z0-9_]+$/
    },
    amount: {
      required: true,
      custom: (value: string) => {
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return "Please enter a valid amount";
        }
        if (amount > 10000) {
          return "Amount cannot exceed $10,000";
        }
        if (walletBalance && amount > walletBalance.available) {
          return "Insufficient funds";
        }
        return null;
      }
    },
    description: {
      maxLength: 200
    },
    paymentMethodId: {
      required: true
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }

    if (field === 'recipient') {
      if (value && !value.startsWith('@')) {
        value = '@' + value;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const result = validator.validate(formData);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await PaymentService.sendMoney({
        toUserId: formData.recipient,
        amount: parseFloat(formData.amount),
        description: formData.description,
        paymentMethodId: parseInt(formData.paymentMethodId)
      });

      onSuccess();
      onClose();
      
      setFormData({
        recipient: "",
        amount: "",
        description: "",
        paymentMethodId: ""
      });
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to send money" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(
    (method: PaymentMethod) => method.id.toString() === formData.paymentMethodId
  );

  const calculateFee = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return 0;
    return PaymentService.calculateTransactionFee(amount);
  };

  const totalAmount = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return 0;
    return amount + calculateFee();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-yellow-400/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Send Money
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">
              Send to
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
                placeholder="@username"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.recipient && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.recipient}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.amount}
              </div>
            )}
            
            {walletBalance && (
              <div className="text-sm text-gray-400">
                Available: {WalletService.formatCurrency(walletBalance.available)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-gray-300">
              Payment Method
            </Label>
            <Select
              value={formData.paymentMethodId}
              onValueChange={(value) => handleInputChange("paymentMethodId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {paymentMethods.map((method: PaymentMethod) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {WalletService.formatPaymentMethod(method)}
                      {method.isDefault && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                          Default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethodId && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.paymentMethodId}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              What's this for? (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Dinner, rent, birthday gift..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
              rows={2}
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
          </div>

          {formData.amount && selectedPaymentMethod && (
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">
                    {WalletService.formatCurrency(parseFloat(formData.amount))}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-white">
                    {WalletService.formatCurrency(calculateFee())}
                  </span>
                </div>
                
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-300">Total</span>
                    <span className="text-yellow-400">
                      {WalletService.formatCurrency(totalAmount())}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  From: {WalletService.formatPaymentMethod(selectedPaymentMethod)}
                </div>
              </CardContent>
            </Card>
          )}

          {errors.submit && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.submit}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.amount || !formData.recipient || !formData.paymentMethodId}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              {isSubmitting ? "Sending..." : `Send ${formData.amount ? WalletService.formatCurrency(parseFloat(formData.amount)) : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}