import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CreditCard, Eye, EyeOff } from "lucide-react";
import { WalletService, type CreateCardMethod } from "../../services/WalletService";
import { FormValidator, CommonValidation } from "../../utils/FormValidation";

interface AddCardFormProps {
  onSubmit: (cardData: CreateCardMethod) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddCardForm({ onSubmit, onCancel, isLoading = false }: AddCardFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: ""
  });
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validator = new FormValidator({
    cardNumber: {
      required: true,
      custom: (value: string) => {
        if (!WalletService.validateCardNumber(value)) {
          return "Please enter a valid card number";
        }
        return null;
      }
    },
    expiryMonth: {
      required: true,
      custom: (value: string) => {
        const month = parseInt(value);
        if (isNaN(month) || month < 1 || month > 12) {
          return "Please enter a valid month (1-12)";
        }
        return null;
      }
    },
    expiryYear: {
      required: true,
      custom: (value: string) => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < currentYear || year > currentYear + 20) {
          return "Please enter a valid year";
        }
        return null;
      }
    },
    cvv: {
      required: true,
      minLength: 3,
      maxLength: 4,
      pattern: /^\d+$/
    },
    holderName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    }
  });

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      processedValue = WalletService.formatCardNumber(value);
    }

    // Limit CVV length based on card type
    if (field === 'cvv') {
      const cardBrand = WalletService.getCardBrand(formData.cardNumber);
      const maxLength = cardBrand === 'amex' ? 4 : 3;
      processedValue = value.replace(/\D/g, '').slice(0, maxLength);
    }

    // Format expiry fields
    if (field === 'expiryMonth' || field === 'expiryYear') {
      processedValue = value.replace(/\D/g, '');
      if (field === 'expiryMonth') {
        processedValue = processedValue.slice(0, 2);
      } else {
        processedValue = processedValue.slice(0, 4);
      }
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const result = validator.validate(formData);
    
    // Additional validation for expiry date
    if (formData.expiryMonth && formData.expiryYear) {
      const month = parseInt(formData.expiryMonth);
      const year = parseInt(formData.expiryYear);
      if (!WalletService.validateExpiryDate(month, year)) {
        result.errors.expiryMonth = "Card has expired or invalid expiry date";
      }
    }

    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const cardData: CreateCardMethod = {
      type: "card",
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      expiryMonth: parseInt(formData.expiryMonth),
      expiryYear: parseInt(formData.expiryYear),
      cvv: formData.cvv,
      holderName: formData.holderName
    };

    onSubmit(cardData);
  };

  const cardBrand = WalletService.getCardBrand(formData.cardNumber);
  const cardIcon = WalletService.getPaymentMethodIcon({ type: 'card', brand: cardBrand } as any);

  return (
    <Card className="w-full max-w-md bg-gray-900 border-yellow-400/30">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Add Credit/Debit Card
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-gray-300">
              Card Number
            </Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10"
                disabled={isLoading}
                maxLength={19}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
                {cardIcon}
              </div>
            </div>
            {errors.cardNumber && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.cardNumber}
              </div>
            )}
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="holderName" className="text-gray-300">
              Cardholder Name
            </Label>
            <Input
              id="holderName"
              value={formData.holderName}
              onChange={(e) => handleInputChange("holderName", e.target.value)}
              placeholder="John Doe"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            {errors.holderName && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.holderName}
              </div>
            )}
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth" className="text-gray-300">
                Month
              </Label>
              <Input
                id="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                placeholder="12"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
                maxLength={2}
              />
              {errors.expiryMonth && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expiryMonth}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear" className="text-gray-300">
                Year
              </Label>
              <Input
                id="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                placeholder="2025"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
                maxLength={4}
              />
              {errors.expiryYear && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expiryYear}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-gray-300">
                CVV
              </Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type={showCvv ? "text" : "password"}
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  placeholder="123"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-8"
                  disabled={isLoading}
                  maxLength={cardBrand === 'amex' ? 4 : 3}
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showCvv ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
              {errors.cvv && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cvv}
                </div>
              )}
            </div>
          </div>

          {/* Card Preview */}
          {formData.cardNumber && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs opacity-75">
                  {cardBrand.toUpperCase()}
                </div>
                <div className="w-8 h-5 bg-white/20 rounded"></div>
              </div>
              
              <div className="text-lg font-mono tracking-wider mb-4">
                {formData.cardNumber || "•••• •••• •••• ••••"}
              </div>
              
              <div className="flex justify-between text-xs">
                <div>
                  <div className="opacity-75">EXPIRES</div>
                  <div>
                    {formData.expiryMonth || "MM"}/{formData.expiryYear || "YYYY"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="opacity-75">CARDHOLDER</div>
                  <div>{formData.holderName || "NAME"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              {isLoading ? "Adding..." : "Add Card"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}