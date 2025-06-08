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
  type?: string;
}

export interface TransactionFilters {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  pendingCount: number;
  averageAmount: number;
}

export class TransactionService {
  static async getAllTransactions(): Promise<Transaction[]> {
    const response = await apiRequest("/api/transactions", "GET");
    return response || [];
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const response = await apiRequest(`/api/users/${userId}/transactions`, "GET");
    return response || [];
  }

  static async getTransaction(id: number): Promise<Transaction> {
    return apiRequest(`/api/transactions/${id}`, "GET");
  }

  static async deleteTransaction(id: number): Promise<void> {
    return apiRequest(`/api/transactions/${id}`, "DELETE");
  }

  static async getTransactionStats(userId: string): Promise<TransactionStats> {
    const transactions = await this.getUserTransactions(userId);
    
    const sent = transactions.filter(t => t.fromUserId === userId);
    const received = transactions.filter(t => t.toUserId === userId);
    const pending = transactions.filter(t => t.status === 'pending');
    
    const totalSent = sent.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalReceived = received.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const averageAmount = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length 
      : 0;

    return {
      totalTransactions: transactions.length,
      totalSent,
      totalReceived,
      pendingCount: pending.length,
      averageAmount
    };
  }

  static filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
    return transactions.filter(transaction => {
      if (filters.status && transaction.status !== filters.status) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const transactionDate = new Date(transaction.createdAt);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) return false;
      }
      
      const amount = parseFloat(transaction.amount);
      if (filters.amountMin && amount < filters.amountMin) return false;
      if (filters.amountMax && amount > filters.amountMax) return false;
      
      return true;
    });
  }

  static sortTransactions(transactions: Transaction[], sortBy: 'date' | 'amount' | 'status', order: 'asc' | 'desc' = 'desc'): Transaction[] {
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.createdAt - b.createdAt;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
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

  static getTransactionDirection(transaction: Transaction, currentUserId: string): 'sent' | 'received' {
    return transaction.fromUserId === currentUserId ? 'sent' : 'received';
  }

  static getOtherParty(transaction: Transaction, currentUserId: string): string {
    return transaction.fromUserId === currentUserId ? transaction.toUserId : transaction.fromUserId;
  }

  static isExternal(transaction: Transaction): boolean {
    return !!(transaction.isExternal || transaction.source);
  }

  static formatTransactionType(transaction: Transaction): string {
    if (this.isExternal(transaction)) {
      return `External (${transaction.source || 'Unknown'})`;
    }
    return transaction.type || 'Internal';
  }

  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString();
    }
  }

  static formatDateRange(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString();
    const end = endDate.toLocaleDateString();
    return start === end ? start : `${start} - ${end}`;
  }
}