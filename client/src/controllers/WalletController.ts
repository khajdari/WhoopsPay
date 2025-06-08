import { BaseController, ControllerResponse, FilterOptions, PaginationOptions, ControllerOptions } from './BaseController';
import { PaymentMethodModel } from '../models/PaymentMethodModel';
import { TransactionModel } from '../models/TransactionModel';
import { UserModel } from '../models/UserModel';

export interface WalletBalance {
  current: number;
  available: number;
  pending: number;
  currency: string;
  lastUpdated: Date;
}

export interface AddPaymentMethodData {
  type: 'card' | 'bank';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  holderName?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  accountType?: string;
}

export interface WalletOperation {
  amount: number;
  paymentMethodId: number;
  description?: string;
  metadata?: Record<string, any>;
}

export class WalletController extends BaseController {
  protected getModelClass() {
    return PaymentMethodModel;
  }

  // Get user's wallet balance
  async getWalletBalance(
    userId: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse<WalletBalance>> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('balance', { userId });
      if (options.cache !== false) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached);
        }
      }

      // Calculate balance from transactions
      const userTransactions = await TransactionModel.findByUser(userId);
      let current = 0;
      let pending = 0;

      for (const transaction of userTransactions) {
        const amount = transaction.amount;
        const isIncoming = transaction.isIncoming(userId);
        const actualAmount = isIncoming ? amount : -amount;

        if (transaction.isCompleted()) {
          current += actualAmount;
        } else if (transaction.isPending()) {
          pending += actualAmount;
        }
      }

      const balance: WalletBalance = {
        current,
        available: current, // In real implementation, subtract holds/reserves
        pending,
        currency: 'USD',
        lastUpdated: new Date()
      };

      // Cache the result
      if (options.cache !== false) {
        this.setCache(cacheKey, balance, 60 * 1000); // 1 minute cache
      }

      return this.createSuccessResponse(balance);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get user's payment methods
  async getPaymentMethods(
    userId: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const result = await this.findAll(
        { userId, isActive: true },
        { sort: 'createdAt', order: 'desc' },
        options
      );

      return result;
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Add new payment method
  async addPaymentMethod(
    userId: string,
    data: AddPaymentMethodData,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Validate input data
      const validationResult = await this.validatePaymentMethodData(data);
      if (!validationResult.isValid) {
        return this.createErrorResponse(
          new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
        );
      }

      // Check user exists and is active
      const user = await UserModel.findById(userId);
      if (!user || !user.isActive) {
        return this.createErrorResponse(new Error('User not found or inactive'));
      }

      // Create payment method based on type
      let paymentMethod: PaymentMethodModel;

      if (data.type === 'card') {
        if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv) {
          return this.createErrorResponse(new Error('Missing required card information'));
        }

        paymentMethod = PaymentMethodModel.createCard(
          userId,
          data.cardNumber,
          data.expiryMonth,
          data.expiryYear,
          data.cvv,
          data.holderName
        );
      } else {
        if (!data.accountNumber || !data.routingNumber || !data.bankName) {
          return this.createErrorResponse(new Error('Missing required bank account information'));
        }

        paymentMethod = PaymentMethodModel.createBankAccount(
          userId,
          data.accountNumber,
          data.routingNumber,
          data.bankName,
          data.accountType,
          data.holderName
        );
      }

      // Check if this should be the default (first payment method)
      const existingMethods = await PaymentMethodModel.findByUser(userId);
      if (existingMethods.length === 0) {
        paymentMethod.isDefault = true;
      }

      // Save the payment method
      await paymentMethod.save();

      // Clear cache
      this.clearPaymentMethodCaches(userId);

      return this.createSuccessResponse(
        paymentMethod.maskSensitiveData(),
        undefined,
        'Payment method added successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Find the payment method
      const paymentMethod = await PaymentMethodModel.findById(paymentMethodId);
      
      if (!paymentMethod) {
        return this.createErrorResponse(new Error('Payment method not found'));
      }

      if (paymentMethod.userId !== userId) {
        return this.createErrorResponse(new Error('Unauthorized access to payment method'));
      }

      if (!paymentMethod.isActive) {
        return this.createErrorResponse(new Error('Cannot set inactive payment method as default'));
      }

      // Set as default
      await paymentMethod.setAsDefault();

      // Clear cache
      this.clearPaymentMethodCaches(userId);

      return this.createSuccessResponse(
        paymentMethod.maskSensitiveData(),
        undefined,
        'Default payment method updated'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Remove payment method
  async removePaymentMethod(
    userId: string,
    paymentMethodId: number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Find the payment method
      const paymentMethod = await PaymentMethodModel.findById(paymentMethodId);
      
      if (!paymentMethod) {
        return this.createErrorResponse(new Error('Payment method not found'));
      }

      if (paymentMethod.userId !== userId) {
        return this.createErrorResponse(new Error('Unauthorized access to payment method'));
      }

      // Check if it's the default method
      if (paymentMethod.isDefault) {
        const otherMethods = await PaymentMethodModel.findByUser(userId);
        if (otherMethods.length > 1) {
          return this.createErrorResponse(
            new Error('Cannot remove default payment method. Set another as default first.')
          );
        }
      }

      // Check for pending transactions using this method
      const pendingTransactions = await this.checkPendingTransactions(paymentMethodId);
      if (pendingTransactions.length > 0) {
        return this.createErrorResponse(
          new Error('Cannot remove payment method with pending transactions')
        );
      }

      // Deactivate instead of deleting for audit trail
      await paymentMethod.deactivate();

      // Clear cache
      this.clearPaymentMethodCaches(userId);

      return this.createSuccessResponse(
        null,
        undefined,
        'Payment method removed successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Add funds to wallet
  async addFunds(
    userId: string,
    operation: WalletOperation,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Validate operation
      const validationResult = await this.validateWalletOperation(operation, 'add');
      if (!validationResult.isValid) {
        return this.createErrorResponse(
          new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
        );
      }

      // Find payment method
      const paymentMethod = await PaymentMethodModel.findById(operation.paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== userId || !paymentMethod.isActive) {
        return this.createErrorResponse(new Error('Invalid payment method'));
      }

      // Calculate fees
      const feeAmount = this.calculateAddFundsFee(operation.amount);

      // Create deposit transaction
      const transaction = new TransactionModel({
        fromUserId: 'system',
        toUserId: userId,
        amount: operation.amount,
        currency: 'USD',
        status: 'pending',
        type: 'deposit',
        description: operation.description || 'Add funds to wallet',
        feeAmount,
        metadata: {
          paymentMethodId: operation.paymentMethodId,
          ...operation.metadata
        },
        createdAt: new Date()
      });

      await transaction.save();

      // Clear balance cache
      this.clearBalanceCache(userId);

      return this.createSuccessResponse(
        {
          transaction: transaction.exportData(),
          fee: feeAmount,
          total: operation.amount + feeAmount
        },
        undefined,
        'Funds added successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Withdraw funds from wallet
  async withdrawFunds(
    userId: string,
    operation: WalletOperation,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Validate operation
      const validationResult = await this.validateWalletOperation(operation, 'withdraw');
      if (!validationResult.isValid) {
        return this.createErrorResponse(
          new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
        );
      }

      // Check wallet balance
      const balanceResult = await this.getWalletBalance(userId);
      if (!balanceResult.success) {
        return balanceResult;
      }

      const balance = balanceResult.data as WalletBalance;
      const feeAmount = this.calculateWithdrawalFee(operation.amount);
      const totalAmount = operation.amount + feeAmount;

      if (balance.available < totalAmount) {
        return this.createErrorResponse(new Error('Insufficient funds'));
      }

      // Find payment method
      const paymentMethod = await PaymentMethodModel.findById(operation.paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== userId || !paymentMethod.isActive) {
        return this.createErrorResponse(new Error('Invalid payment method'));
      }

      // Create withdrawal transaction
      const transaction = new TransactionModel({
        fromUserId: userId,
        toUserId: 'system',
        amount: operation.amount,
        currency: 'USD',
        status: 'pending',
        type: 'withdrawal',
        description: operation.description || 'Withdraw funds from wallet',
        feeAmount,
        metadata: {
          paymentMethodId: operation.paymentMethodId,
          ...operation.metadata
        },
        createdAt: new Date()
      });

      await transaction.save();

      // Clear balance cache
      this.clearBalanceCache(userId);

      return this.createSuccessResponse(
        {
          transaction: transaction.exportData(),
          fee: feeAmount,
          total: totalAmount
        },
        undefined,
        'Withdrawal initiated successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get wallet activity (transactions)
  async getWalletActivity(
    userId: string,
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const transactions = await TransactionModel.findByUser(userId);
      
      // Apply pagination
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;
      
      const paginatedTransactions = transactions.slice(offset, offset + limit);
      const hasMore = transactions.length > offset + limit;

      return this.createSuccessResponse(
        paginatedTransactions.map(t => t.exportData()),
        {
          total: transactions.length,
          page,
          limit,
          hasNext: hasMore,
          hasPrevious: page > 1
        }
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get wallet statistics
  async getWalletStats(
    userId: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const cacheKey = this.generateCacheKey('walletStats', { userId });
      
      if (options.cache !== false) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached);
        }
      }

      const [transactions, paymentMethods, balance] = await Promise.all([
        TransactionModel.findByUser(userId),
        PaymentMethodModel.findByUser(userId),
        this.getWalletBalance(userId)
      ]);

      const stats = {
        balance: balance.success ? balance.data : null,
        totalTransactions: transactions.length,
        paymentMethodsCount: paymentMethods.length,
        monthlySpending: this.calculateMonthlySpending(transactions, userId),
        topCategories: this.getTopTransactionCategories(transactions),
        recentActivity: transactions.slice(0, 5).map(t => t.exportData())
      };

      if (options.cache !== false) {
        this.setCache(cacheKey, stats, 5 * 60 * 1000); // 5 minutes
      }

      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Private helper methods
  private async validatePaymentMethodData(data: AddPaymentMethodData): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    const errors: Record<string, string> = {};

    if (!data.type || !['card', 'bank'].includes(data.type)) {
      errors.type = 'Invalid payment method type';
    }

    if (data.type === 'card') {
      if (!data.cardNumber) {
        errors.cardNumber = 'Card number is required';
      } else {
        const model = new PaymentMethodModel();
        if (!model.validateCardNumber(data.cardNumber)) {
          errors.cardNumber = 'Invalid card number';
        }
      }

      if (!data.expiryMonth || data.expiryMonth < 1 || data.expiryMonth > 12) {
        errors.expiryMonth = 'Valid expiry month is required';
      }

      if (!data.expiryYear || data.expiryYear < new Date().getFullYear()) {
        errors.expiryYear = 'Valid expiry year is required';
      }

      if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
        errors.cvv = 'Valid CVV is required';
      }
    }

    if (data.type === 'bank') {
      if (!data.accountNumber || !/^\d{4,17}$/.test(data.accountNumber)) {
        errors.accountNumber = 'Valid account number is required';
      }

      if (!data.routingNumber || !/^\d{9}$/.test(data.routingNumber)) {
        errors.routingNumber = 'Valid routing number is required';
      }

      if (!data.bankName || data.bankName.trim().length < 2) {
        errors.bankName = 'Bank name is required';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private async validateWalletOperation(
    operation: WalletOperation,
    type: 'add' | 'withdraw'
  ): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    const errors: Record<string, string> = {};

    if (!operation.amount || operation.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (operation.amount > 50000) {
      errors.amount = 'Amount cannot exceed $50,000';
    }

    if (!operation.paymentMethodId) {
      errors.paymentMethodId = 'Payment method is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private calculateAddFundsFee(amount: number): number {
    // Standard fee: 2.9% + $0.30
    return Math.max(0.30, amount * 0.029);
  }

  private calculateWithdrawalFee(amount: number): number {
    // Standard withdrawal fee: 1% minimum $1.00
    return Math.max(1.00, amount * 0.01);
  }

  private async checkPendingTransactions(paymentMethodId: number): Promise<TransactionModel[]> {
    // This would check for transactions using this payment method
    // For now, return empty array as this would require transaction metadata queries
    return [];
  }

  private calculateMonthlySpending(transactions: TransactionModel[], userId: string): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => 
        t.createdAt >= monthStart && 
        t.isOutgoing(userId) && 
        t.isCompleted()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private getTopTransactionCategories(transactions: TransactionModel[]): Array<{
    category: string;
    amount: number;
    count: number;
  }> {
    const categories = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(t => {
      const category = t.type || 'Other';
      const existing = categories.get(category) || { amount: 0, count: 0 };
      categories.set(category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    });

    return Array.from(categories.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private clearPaymentMethodCaches(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.includes('WalletController') && key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private clearBalanceCache(userId: string): void {
    const balanceKey = this.generateCacheKey('balance', { userId });
    const statsKey = this.generateCacheKey('walletStats', { userId });
    
    this.cache.delete(balanceKey);
    this.cache.delete(statsKey);
  }
}