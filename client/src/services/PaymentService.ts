import { apiRequest } from "@/lib/queryClient";

export interface Transaction {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  status: string;
  description?: string;
  createdAt: number;
  isExternal?: boolean;
  source?: string;
}

export interface PaymentRequest {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  description?: string;
  status: string;
  createdAt: number;
  isExternal?: boolean;
  source?: string;
  orderId?: string;
  returnUrl?: string;
}

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

export interface CreatePayment {
  toUserId: string;
  amount: string;
  description?: string;
}

export interface CreatePaymentMethod {
  type: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
}

export class PaymentService {
  static async getPendingRequests(): Promise<PaymentRequest[]> {
    const response = await apiRequest("/api/pending-requests", "GET");
    return response || [];
  }

  static async getTransactions(): Promise<Transaction[]> {
    const response = await apiRequest("/api/transactions", "GET");
    return response || [];
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response = await apiRequest(`/api/payments?userId=${userId}`, "GET");
    return response || [];
  }

  static async createPayment(payment: CreatePayment): Promise<Transaction> {
    return apiRequest("/api/send-money", "POST", payment);
  }

  static async addPaymentMethod(method: CreatePaymentMethod): Promise<PaymentMethod> {
    return apiRequest("/api/payment-methods", "POST", method);
  }

  static async deletePaymentMethod(id: number): Promise<void> {
    return apiRequest(`/api/payment-methods/${id}`, "DELETE");
  }

  static async approvePaymentRequest(id: number): Promise<void> {
    return apiRequest(`/api/requests/${id}/approve`, "POST");
  }

  static async rejectPaymentRequest(id: number): Promise<void> {
    return apiRequest(`/api/requests/${id}/reject`, "POST");
  }

  static async approveExternalPayment(transactionId: number): Promise<void> {
    return apiRequest(`/api/external/payment/${transactionId}/approve`, "POST");
  }

  static async rejectExternalPayment(transactionId: number): Promise<void> {
    return apiRequest(`/api/external/payment/${transactionId}/reject`, "POST");
  }

  static async getExternalPaymentStatus(transactionId: number): Promise<any> {
    return apiRequest(`/api/external/payment/${transactionId}/status`, "GET");
  }

  static formatAmount(amount: string | number, currency = "USD"): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  }

  static formatStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return '🟡 Pending';
      case 'completed': return '✅ Completed';
      case 'failed': return '❌ Failed';
      case 'cancelled': return '⭕ Cancelled';
      case 'approved': return '✅ Approved';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  }

  static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'approved': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'rejected': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  }

  static formatPaymentMethod(method: PaymentMethod): string {
    if (method.type === 'card') {
      return `${method.brand || 'Card'} ****${method.last4}`;
    }
    if (method.type === 'bank') {
      return `${method.bankName || 'Bank'} ****${method.accountNumber?.slice(-4)}`;
    }
    return method.type;
  }

  static isExternal(transaction: Transaction | PaymentRequest): boolean {
    return !!(transaction.isExternal || transaction.source);
  }

  static getExternalSource(transaction: Transaction | PaymentRequest): string {
    return transaction.source || 'External';
  }
}