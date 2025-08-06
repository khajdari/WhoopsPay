import { apiRequest } from "@/lib/queryClient";

export interface PaymentMethod {
  id: number;
  userId: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  isDefault?: boolean;
  createdAt?: number;
}

export interface CreateCardMethod {
  type: "card";
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  holderName?: string;
}

export interface CreateBankMethod {
  type: "bank";
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType?: string;
}

export interface WalletBalance {
  current: number;
  available: number;
  pending: number;
  currency: string;
}

export interface AddFundsRequest {
  amount: number;
  paymentMethodId: number;
  description?: string;
}

export interface WithdrawFundsRequest {
  amount: number;
  paymentMethodId: number;
  description?: string;
}

export class WalletService {
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response = await apiRequest(`/api/payments?userId=${userId}`, "GET");
    return response || [];
  }

  static async addPaymentMethod(method: CreateCardMethod | CreateBankMethod): Promise<PaymentMethod> {
    return apiRequest("/api/payment-methods", "POST", method);
  }

  static async deletePaymentMethod(id: number): Promise<void> {
    return apiRequest(`/api/payment-methods/${id}`, "DELETE");
  }

  static async setDefaultPaymentMethod(id: number): Promise<void> {
    return apiRequest(`/api/payment-methods/${id}/default`, "PUT");
  }

  static async addFunds(request: AddFundsRequest): Promise<any> {
    return apiRequest("/api/wallet/add-funds", "POST", request);
  }

  static async withdrawFunds(request: WithdrawFundsRequest): Promise<any> {
    return apiRequest("/api/wallet/withdraw", "POST", request);
  }

  static async getWalletBalance(userId: string): Promise<WalletBalance> {
    const response = await apiRequest(`/api/wallet/${userId}/balance`, "GET");
    return response || { current: 0, available: 0, pending: 0, currency: "GCU" };
  }

  static formatPaymentMethod(method: PaymentMethod): string {
    if (method.type === 'card') {
      const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card';
      return `${brand} ****${method.last4}`;
    }
    if (method.type === 'bank') {
      const bankName = method.bankName || 'Bank Account';
      return `${bankName} ****${method.accountNumber?.slice(-4)}`;
    }
    return method.type.charAt(0).toUpperCase() + method.type.slice(1);
  }

  static getPaymentMethodIcon(method: PaymentMethod): string {
    if (method.type === 'card') {
      switch (method.brand?.toLowerCase()) {
        case 'visa': return '💳';
        case 'mastercard': return '💳';
        case 'amex': return '💳';
        case 'discover': return '💳';
        default: return '💳';
      }
    }
    if (method.type === 'bank') {
      return '🏦';
    }
    return '💰';
  }

  static validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check length
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  static getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }

  static formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  }

  static validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  }

  static validateRoutingNumber(routingNumber: string): boolean {
    const cleaned = routingNumber.replace(/\D/g, '');
    return cleaned.length === 9;
  }

  static validateAccountNumber(accountNumber: string): boolean {
    const cleaned = accountNumber.replace(/\D/g, '');
    return cleaned.length >= 4 && cleaned.length <= 17;
  }

  static formatCurrency(amount: number, currency = "GCU"): string {
    // Use generic currency symbol instead of specific currency
    return `¤${amount.toFixed(2)}`;
  }

  static calculateFees(amount: number, type: 'add' | 'withdraw'): number {
    // Example fee structure
    if (type === 'add') {
      return Math.max(0.30, amount * 0.029); // 2.9% + ¤0.30
    }
    if (type === 'withdraw') {
      return Math.max(1.00, amount * 0.01); // 1% minimum ¤1.00
    }
    return 0;
  }

  static isExpired(method: PaymentMethod): boolean {
    if (method.type !== 'card' || !method.expiryMonth || !method.expiryYear) {
      return false;
    }
    
    const now = new Date();
    const expiry = new Date(method.expiryYear, method.expiryMonth - 1, 1);
    return now > expiry;
  }

  static getExpiryStatus(method: PaymentMethod): 'valid' | 'expiring' | 'expired' {
    if (method.type !== 'card' || !method.expiryMonth || !method.expiryYear) {
      return 'valid';
    }
    
    const now = new Date();
    const expiry = new Date(method.expiryYear, method.expiryMonth - 1, 1);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    if (now > expiry) return 'expired';
    if (expiry < threeMonthsFromNow) return 'expiring';
    return 'valid';
  }
}