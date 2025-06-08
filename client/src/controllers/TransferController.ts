import { BaseController, ControllerOptions } from './BaseController';
import { TransactionModel } from '../models/TransactionModel';
import { UserModel } from '../models/UserModel';
import { PaymentMethodModel } from '../models/PaymentMethodModel';
import { apiRequest } from '../lib/queryClient';

export interface TransferData {
  recipientEmail: string;
  amount: number;
  description?: string;
  paymentMethodId: string;
}

export interface TransferValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface TransferEstimate {
  amount: number;
  fees: number;
  total: number;
  processingTime: string;
  exchangeRate?: number;
}

export interface TransferLimits {
  daily: { used: number; limit: number };
  monthly: { used: number; limit: number };
  perTransaction: { min: number; max: number };
}

export class TransferController extends BaseController {
  private static instance: TransferController;
  private readonly TRANSFER_LIMITS = {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 10000,
    DAILY_LIMIT: 25000,
    MONTHLY_LIMIT: 100000,
    FEE_PERCENTAGE: 0.025, // 2.5%
    MIN_FEE: 0.50
  };

  constructor(options?: ControllerOptions) {
    super(options);
  }

  static getInstance(options?: ControllerOptions): TransferController {
    if (!TransferController.instance) {
      TransferController.instance = new TransferController(options);
    }
    return TransferController.instance;
  }

  /**
   * Validate transfer data before processing
   */
  async validateTransfer(
    transferData: TransferData,
    senderUserId: string
  ): Promise<TransferValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      if (!transferData.recipientEmail) {
        errors.push('Recipient email is required');
      } else if (!/\S+@\S+\.\S+/.test(transferData.recipientEmail)) {
        errors.push('Invalid email format');
      }

      if (!transferData.amount || transferData.amount <= 0) {
        errors.push('Valid amount is required');
      } else {
        if (transferData.amount < this.TRANSFER_LIMITS.MIN_AMOUNT) {
          errors.push(`Minimum transfer amount is $${this.TRANSFER_LIMITS.MIN_AMOUNT}`);
        }
        if (transferData.amount > this.TRANSFER_LIMITS.MAX_AMOUNT) {
          errors.push(`Maximum transfer amount is $${this.TRANSFER_LIMITS.MAX_AMOUNT}`);
        }
      }

      if (!transferData.paymentMethodId) {
        errors.push('Payment method is required');
      }

      // Get sender user data
      const senderResult = await this.findById(UserModel, senderUserId);
      if (!senderResult.success || !senderResult.data) {
        errors.push('Invalid sender account');
        return { isValid: false, errors };
      }

      const sender = senderResult.data as UserModel;

      // Check if trying to send to self
      if (transferData.recipientEmail === sender.email) {
        errors.push('Cannot send money to yourself');
      }

      // Validate recipient exists
      const recipientResult = await apiRequest('/api/users/search', 'POST', {
        email: transferData.recipientEmail
      });

      if (!recipientResult || recipientResult.length === 0) {
        errors.push('Recipient not found');
      }

      // Check transfer limits
      const limitsResult = await this.getTransferLimits(senderUserId);
      if (limitsResult.success && limitsResult.data) {
        const limits = limitsResult.data as TransferLimits;
        
        if (limits.daily.used + transferData.amount > limits.daily.limit) {
          errors.push(`Daily transfer limit exceeded (${limits.daily.limit - limits.daily.used} remaining)`);
        }
        
        if (limits.monthly.used + transferData.amount > limits.monthly.limit) {
          errors.push(`Monthly transfer limit exceeded`);
        }

        // Warnings for high amounts
        if (transferData.amount > 5000) {
          warnings.push('Large transfer amounts may require additional verification');
        }
      }

      // Validate payment method
      const paymentMethodResult = await apiRequest(`/api/payments/${transferData.paymentMethodId}`, 'GET');
      if (!paymentMethodResult) {
        errors.push('Invalid payment method');
      } else {
        const paymentMethod = new PaymentMethodModel(paymentMethodResult);
        if (!paymentMethod.isActive) {
          errors.push('Selected payment method is not active');
        }
        if (paymentMethod.isExpired()) {
          errors.push('Selected payment method has expired');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation failed: ' + (error as Error).message]
      };
    }
  }

  /**
   * Calculate transfer estimate with fees
   */
  async calculateTransferEstimate(
    amount: number,
    recipientEmail: string,
    paymentMethodId?: string
  ): Promise<{ success: boolean; data?: TransferEstimate; error?: string }> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }

      const fee = Math.max(
        amount * this.TRANSFER_LIMITS.FEE_PERCENTAGE,
        this.TRANSFER_LIMITS.MIN_FEE
      );

      const total = amount + fee;

      // Determine processing time based on amount and payment method
      let processingTime = 'Instant';
      if (amount > 1000) {
        processingTime = '1-2 business days';
      } else if (amount > 5000) {
        processingTime = '2-3 business days';
      }

      const estimate: TransferEstimate = {
        amount,
        fees: fee,
        total,
        processingTime
      };

      return { success: true, data: estimate };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to calculate transfer estimate: ' + (error as Error).message
      };
    }
  }

  /**
   * Get transfer limits for user
   */
  async getTransferLimits(
    userId: string
  ): Promise<{ success: boolean; data?: TransferLimits; error?: string }> {
    try {
      const cacheKey = `transfer_limits_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      // Get user's transfer history for current day/month
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [dailyTransfers, monthlyTransfers] = await Promise.all([
        apiRequest('/api/transactions', 'GET', {
          userId,
          type: 'transfer',
          fromDate: startOfDay.toISOString(),
          status: ['completed', 'pending']
        }),
        apiRequest('/api/transactions', 'GET', {
          userId,
          type: 'transfer',
          fromDate: startOfMonth.toISOString(),
          status: ['completed', 'pending']
        })
      ]);

      const dailyUsed = dailyTransfers?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
      const monthlyUsed = monthlyTransfers?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

      const limits: TransferLimits = {
        daily: {
          used: dailyUsed,
          limit: this.TRANSFER_LIMITS.DAILY_LIMIT
        },
        monthly: {
          used: monthlyUsed,
          limit: this.TRANSFER_LIMITS.MONTHLY_LIMIT
        },
        perTransaction: {
          min: this.TRANSFER_LIMITS.MIN_AMOUNT,
          max: this.TRANSFER_LIMITS.MAX_AMOUNT
        }
      };

      this.setCache(cacheKey, limits, 300); // Cache for 5 minutes
      return { success: true, data: limits };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get transfer limits: ' + (error as Error).message
      };
    }
  }

  /**
   * Process money transfer
   */
  async processTransfer(
    transferData: TransferData,
    senderUserId: string
  ): Promise<{ success: boolean; data?: TransactionModel; error?: string }> {
    try {
      // Validate transfer first
      const validation = await this.validateTransfer(transferData, senderUserId);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Get recipient user ID
      const recipientResult = await apiRequest('/api/users/search', 'POST', {
        email: transferData.recipientEmail
      });

      if (!recipientResult || recipientResult.length === 0) {
        return { success: false, error: 'Recipient not found' };
      }

      const recipient = recipientResult[0];

      // Calculate fees
      const estimateResult = await this.calculateTransferEstimate(
        transferData.amount,
        transferData.recipientEmail,
        transferData.paymentMethodId
      );

      if (!estimateResult.success) {
        return { success: false, error: estimateResult.error };
      }

      const estimate = estimateResult.data!;

      // Create transaction
      const transactionData = {
        fromUserId: senderUserId,
        toUserId: recipient.id,
        amount: transferData.amount,
        fee: estimate.fees,
        description: transferData.description || 'Money transfer',
        type: 'transfer',
        status: 'pending',
        paymentMethodId: transferData.paymentMethodId,
        metadata: {
          recipientEmail: transferData.recipientEmail,
          processingTime: estimate.processingTime,
          transferId: `TR${Date.now()}${Math.random().toString(36).substr(2, 5)}`
        }
      };

      const result = await apiRequest('/api/transactions', 'POST', transactionData);
      
      if (result) {
        const transaction = new TransactionModel(result);
        
        // Clear relevant caches
        this.clearCache(`transfer_limits_${senderUserId}`);
        this.clearCache(`user_transactions_${senderUserId}`);
        this.clearCache(`user_transactions_${recipient.id}`);

        // Log transfer activity
        await this.logActivity(senderUserId, 'transfer_initiated', {
          transferId: transaction.id,
          amount: transferData.amount,
          recipient: transferData.recipientEmail
        });

        return { success: true, data: transaction };
      }

      return { success: false, error: 'Failed to create transfer transaction' };

    } catch (error) {
      return {
        success: false,
        error: 'Transfer processing failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get transfer history for user
   */
  async getTransferHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<{ success: boolean; data?: TransactionModel[]; pagination?: any; error?: string }> {
    try {
      const cacheKey = `transfer_history_${userId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached.data, pagination: cached.pagination };
      }

      const params: any = {
        userId,
        type: 'transfer',
        page: options.page || 1,
        limit: options.limit || 20
      };

      if (options.status) {
        params.status = options.status;
      }

      if (options.dateRange) {
        params.fromDate = options.dateRange.start.toISOString();
        params.toDate = options.dateRange.end.toISOString();
      }

      const response = await apiRequest('/api/transactions', 'GET', params);
      
      if (response) {
        const transactions = response.data?.map((t: any) => new TransactionModel(t)) || [];
        const result = {
          data: transactions,
          pagination: response.pagination
        };

        this.setCache(cacheKey, result, 180); // Cache for 3 minutes
        return { success: true, ...result };
      }

      return { success: false, error: 'Failed to fetch transfer history' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get transfer history: ' + (error as Error).message
      };
    }
  }

  /**
   * Cancel pending transfer
   */
  async cancelTransfer(
    transferId: number,
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get transfer details
      const transferResult = await this.findById(TransactionModel, transferId);
      if (!transferResult.success || !transferResult.data) {
        return { success: false, error: 'Transfer not found' };
      }

      const transfer = transferResult.data as TransactionModel;

      // Verify user can cancel this transfer
      if (transfer.fromUserId !== userId && transfer.toUserId !== userId) {
        return { success: false, error: 'Unauthorized to cancel this transfer' };
      }

      // Check if transfer can be cancelled
      if (transfer.status !== 'pending') {
        return { success: false, error: 'Only pending transfers can be cancelled' };
      }

      // Cancel the transfer
      const result = await apiRequest(`/api/transactions/${transferId}/cancel`, 'POST', {
        reason: reason || 'Cancelled by user'
      });

      if (result) {
        // Clear relevant caches
        this.clearCache(`transfer_limits_${userId}`);
        this.clearCache(`user_transactions_${transfer.fromUserId}`);
        this.clearCache(`user_transactions_${transfer.toUserId}`);

        // Log cancellation activity
        await this.logActivity(userId, 'transfer_cancelled', {
          transferId,
          reason
        });

        return { success: true };
      }

      return { success: false, error: 'Failed to cancel transfer' };

    } catch (error) {
      return {
        success: false,
        error: 'Transfer cancellation failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get recent recipients for quick transfer
   */
  async getRecentRecipients(
    userId: string,
    limit: number = 5
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const cacheKey = `recent_recipients_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await apiRequest('/api/transactions/recent-recipients', 'GET', {
        userId,
        limit
      });

      if (response) {
        this.setCache(cacheKey, response, 600); // Cache for 10 minutes
        return { success: true, data: response };
      }

      return { success: false, error: 'Failed to fetch recent recipients' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get recent recipients: ' + (error as Error).message
      };
    }
  }

  /**
   * Search for users by email or username for transfers
   */
  async searchRecipients(
    query: string,
    currentUserId: string
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!query || query.length < 3) {
        return { success: false, error: 'Search query must be at least 3 characters' };
      }

      const response = await apiRequest('/api/users/search', 'POST', {
        query,
        excludeUserId: currentUserId,
        limit: 10
      });

      if (response) {
        // Filter out sensitive data
        const filteredResults = response.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        }));

        return { success: true, data: filteredResults };
      }

      return { success: false, error: 'No users found' };

    } catch (error) {
      return {
        success: false,
        error: 'User search failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Log transfer-related activity
   */
  private async logActivity(
    userId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    try {
      await apiRequest('/api/activity-log', 'POST', {
        userId,
        action,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          module: 'transfer'
        }
      });
    } catch (error) {
      // Don't fail the main operation if logging fails
      console.warn('Failed to log transfer activity:', error);
    }
  }
}