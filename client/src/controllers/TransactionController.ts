import { BaseController, ControllerResponse, FilterOptions, PaginationOptions, ControllerOptions } from './BaseController';
import { TransactionModel } from '../models/TransactionModel';
import { UserModel } from '../models/UserModel';

export interface TransactionFilters extends FilterOptions {
  status?: string;
  type?: string;
  userId?: string;
  fromUserId?: string;
  toUserId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  externalSource?: string;
}

export interface CreateTransactionData {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
  description?: string;
  type?: string;
  feeAmount?: number;
  externalOrderId?: string;
  externalSource?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  averageAmount: number;
  volumeByStatus: Record<string, number>;
  volumeByType: Record<string, number>;
}

export class TransactionController extends BaseController {
  protected getModelClass() {
    return TransactionModel;
  }

  // Enhanced transaction listing with filters
  async getTransactions(
    filters: TransactionFilters = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Process and validate filters
      const processedFilters = await this.processTransactionFilters(filters);
      
      return await this.findAll(processedFilters, pagination, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get transactions for a specific user
  async getUserTransactions(
    userId: string,
    filters: TransactionFilters = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Validate user ID
      if (!userId) {
        return this.createErrorResponse(new Error('User ID is required'));
      }

      // Add user filter
      const userFilters = {
        ...filters,
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      };

      return await this.getTransactions(userFilters, pagination, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get pending transactions
  async getPendingTransactions(
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      return await this.getTransactions(
        { status: 'pending' },
        { ...pagination, sort: 'createdAt', order: 'asc' },
        options
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Get external transactions
  async getExternalTransactions(
    source?: string,
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const filters: TransactionFilters = { type: 'external' };
      
      if (source) {
        filters.externalSource = source;
      }

      return await this.getTransactions(filters, pagination, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Create a new transaction
  async createTransaction(
    data: CreateTransactionData,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Enhanced validation for transaction creation
      const validationResult = await this.validateTransactionData(data);
      if (!validationResult.isValid) {
        return this.createErrorResponse(
          new Error(`Validation failed: ${Object.values(validationResult.errors).join(', ')}`)
        );
      }

      // Check user balances and permissions
      const permissionCheck = await this.checkTransactionPermissions(data);
      if (!permissionCheck.allowed) {
        return this.createErrorResponse(new Error(permissionCheck.reason));
      }

      // Calculate fees if not provided
      if (!data.feeAmount) {
        data.feeAmount = await this.calculateTransactionFee(data.amount, data.type || 'transfer');
      }

      // Create transaction with pending status
      const transactionData = {
        ...data,
        status: 'pending',
        currency: data.currency || 'GCU',
        type: data.type || 'transfer',
        createdAt: new Date()
      };

      const result = await this.create(transactionData, options);

      // If successful, initiate transaction processing
      if (result.success && result.data) {
        this.initiateTransactionProcessing(result.data);
      }

      return result;
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Process transaction status updates
  async updateTransactionStatus(
    id: number,
    status: string,
    reason?: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Validate status
      const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return this.createErrorResponse(new Error('Invalid transaction status'));
      }

      // Get current transaction
      const transactionResult = await this.findById(id, options);
      if (!transactionResult.success || !transactionResult.data) {
        return transactionResult;
      }

      const transaction = transactionResult.data as TransactionModel;

      // Check if status update is allowed
      const canUpdate = this.canUpdateStatus(transaction.status, status);
      if (!canUpdate.allowed) {
        return this.createErrorResponse(new Error(canUpdate.reason));
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        status,
        processedAt: new Date()
      };

      // Add reason to metadata if provided
      if (reason) {
        const currentMetadata = transaction.metadata;
        updateData.metadata = {
          ...currentMetadata,
          statusReason: reason,
          statusUpdatedAt: new Date()
        };
      }

      // Update transaction
      const result = await this.update(id, updateData, options);

      // Handle side effects based on status
      if (result.success) {
        await this.handleStatusChangeEffects(transaction, status, reason);
      }

      return result;
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Cancel a transaction
  async cancelTransaction(
    id: number,
    reason: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    return this.updateTransactionStatus(id, 'cancelled', reason, options);
  }

  // Complete a transaction
  async completeTransaction(
    id: number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    return this.updateTransactionStatus(id, 'completed', undefined, options);
  }

  // Fail a transaction
  async failTransaction(
    id: number,
    reason: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    return this.updateTransactionStatus(id, 'failed', reason, options);
  }

  // Get transaction statistics
  async getTransactionStats(
    filters: TransactionFilters = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse<TransactionStats>> {
    try {
      const cacheKey = this.generateCacheKey('stats', filters);
      
      // Check cache first
      if (options.cache !== false) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached);
        }
      }

      // Get all transactions matching filters
      const transactionsResult = await this.getTransactions(
        filters,
        { limit: 10000 }, // Large limit to get all for stats
        { cache: false }
      );

      if (!transactionsResult.success) {
        return transactionsResult;
      }

      const transactions = transactionsResult.data as TransactionModel[];

      // Calculate statistics
      const stats = this.calculateTransactionStats(transactions);

      // Cache the result
      if (options.cache !== false) {
        this.setCache(cacheKey, stats, 2 * 60 * 1000); // 2 minutes cache
      }

      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Search transactions
  async searchTransactions(
    query: string,
    filters: TransactionFilters = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      return await this.search(query, filters, pagination, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Export transactions
  async exportTransactions(
    filters: TransactionFilters = {},
    format: 'csv' | 'json' = 'csv',
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Get all transactions matching filters
      const transactionsResult = await this.getTransactions(
        filters,
        { limit: 10000 },
        { cache: false }
      );

      if (!transactionsResult.success) {
        return transactionsResult;
      }

      const transactions = transactionsResult.data as TransactionModel[];

      // Format for export
      let exportData: any;
      if (format === 'csv') {
        exportData = this.formatTransactionsForCSV(transactions);
      } else {
        exportData = transactions.map(t => t.exportData());
      }

      return this.createSuccessResponse(exportData, {
        format,
        count: transactions.length,
        exportedAt: new Date()
      });
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Private helper methods
  private async processTransactionFilters(filters: TransactionFilters): Promise<FilterOptions> {
    const processedFilters: FilterOptions = { ...filters };

    // Handle date range filters
    if (filters.startDate || filters.endDate) {
      processedFilters.createdAt = {};
      
      if (filters.startDate) {
        processedFilters.createdAt.$gte = filters.startDate;
        delete processedFilters.startDate;
      }
      
      if (filters.endDate) {
        processedFilters.createdAt.$lte = filters.endDate;
        delete processedFilters.endDate;
      }
    }

    // Handle amount range filters
    if (filters.minAmount || filters.maxAmount) {
      processedFilters.amount = {};
      
      if (filters.minAmount) {
        processedFilters.amount.$gte = filters.minAmount;
        delete processedFilters.minAmount;
      }
      
      if (filters.maxAmount) {
        processedFilters.amount.$lte = filters.maxAmount;
        delete processedFilters.maxAmount;
      }
    }

    return processedFilters;
  }

  private async validateTransactionData(data: CreateTransactionData): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.fromUserId) errors.fromUserId = 'From user ID is required';
    if (!data.toUserId) errors.toUserId = 'To user ID is required';
    if (!data.amount || data.amount <= 0) errors.amount = 'Valid amount is required';

    // Amount validation
    if (data.amount && data.amount > 1000000) {
      errors.amount = 'Amount cannot exceed ¤1,000,000';
    }

    // Self-transaction check
    if (data.fromUserId === data.toUserId) {
      errors.toUserId = 'Cannot send money to yourself';
    }

    // Currency validation
    if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
      errors.currency = 'Currency must be a valid 3-letter code';
    }

    // Fee validation
    if (data.feeAmount && data.feeAmount < 0) {
      errors.feeAmount = 'Fee amount cannot be negative';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private async checkTransactionPermissions(data: CreateTransactionData): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      // Check if users exist and are active
      const [fromUser, toUser] = await Promise.all([
        UserModel.findById(data.fromUserId),
        UserModel.findById(data.toUserId)
      ]);

      if (!fromUser) {
        return { allowed: false, reason: 'Sender not found' };
      }

      if (!toUser) {
        return { allowed: false, reason: 'Recipient not found' };
      }

      if (!fromUser.isActive) {
        return { allowed: false, reason: 'Sender account is inactive' };
      }

      if (!toUser.isActive) {
        return { allowed: false, reason: 'Recipient account is inactive' };
      }

      // Add additional permission checks here (balance, limits, etc.)

      return { allowed: true };
    } catch (error) {
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  private async calculateTransactionFee(amount: number, type: string): Promise<number> {
    // Standard fee calculation
    switch (type) {
      case 'transfer':
        return Math.max(0.30, amount * 0.029); // 2.9% + ¤0.30
      case 'external':
        return Math.max(0.50, amount * 0.035); // 3.5% + ¤0.50
      case 'withdrawal':
        return Math.max(1.00, amount * 0.01); // 1% minimum ¤1.00
      case 'deposit':
        return 0; // No fee for deposits
      default:
        return Math.max(0.30, amount * 0.029);
    }
  }

  private canUpdateStatus(currentStatus: string, newStatus: string): {
    allowed: boolean;
    reason?: string;
  } {
    const allowedTransitions: Record<string, string[]> = {
      pending: ['completed', 'failed', 'cancelled'],
      completed: [], // Completed transactions cannot be changed
      failed: ['pending'], // Failed transactions can be retried
      cancelled: ['pending'] // Cancelled transactions can be restarted
    };

    const allowed = allowedTransitions[currentStatus]?.includes(newStatus) || false;
    
    return {
      allowed,
      reason: allowed ? undefined : `Cannot change status from ${currentStatus} to ${newStatus}`
    };
  }

  private async handleStatusChangeEffects(
    transaction: TransactionModel,
    newStatus: string,
    reason?: string
  ): Promise<void> {
    try {
      switch (newStatus) {
        case 'completed':
          await this.handleTransactionCompletion(transaction);
          break;
        case 'failed':
          await this.handleTransactionFailure(transaction, reason);
          break;
        case 'cancelled':
          await this.handleTransactionCancellation(transaction, reason);
          break;
      }
    } catch (error) {
      console.error('Error handling status change effects:', error);
    }
  }

  private async handleTransactionCompletion(transaction: TransactionModel): Promise<void> {
    // Handle wallet balance updates, notifications, etc.
    // This would typically involve calling other controllers or services
  }

  private async handleTransactionFailure(transaction: TransactionModel, reason?: string): Promise<void> {
    // Handle failure notifications, refunds, etc.
  }

  private async handleTransactionCancellation(transaction: TransactionModel, reason?: string): Promise<void> {
    // Handle cancellation notifications, cleanup, etc.
  }

  private async initiateTransactionProcessing(transaction: TransactionModel): Promise<void> {
    // Start background processing for the transaction
    // This could involve external payment processors, verification, etc.
  }

  private calculateTransactionStats(transactions: TransactionModel[]): TransactionStats {
    const stats: TransactionStats = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      pendingCount: 0,
      completedCount: 0,
      failedCount: 0,
      averageAmount: 0,
      volumeByStatus: {},
      volumeByType: {}
    };

    for (const transaction of transactions) {
      stats.totalVolume += transaction.amount;

      // Count by status
      switch (transaction.status) {
        case 'pending':
          stats.pendingCount++;
          break;
        case 'completed':
          stats.completedCount++;
          break;
        case 'failed':
          stats.failedCount++;
          break;
      }

      // Volume by status
      stats.volumeByStatus[transaction.status] = 
        (stats.volumeByStatus[transaction.status] || 0) + transaction.amount;

      // Volume by type
      stats.volumeByType[transaction.type] = 
        (stats.volumeByType[transaction.type] || 0) + transaction.amount;
    }

    stats.averageAmount = stats.totalTransactions > 0 ? 
      stats.totalVolume / stats.totalTransactions : 0;

    return stats;
  }

  private formatTransactionsForCSV(transactions: TransactionModel[]): string {
    const headers = [
      'ID', 'From User', 'To User', 'Amount', 'Currency', 'Status', 'Type',
      'Description', 'Fee Amount', 'Created At', 'Processed At'
    ];

    const rows = transactions.map(t => [
      t.id,
      t.fromUserId,
      t.toUserId,
      t.amount,
      t.currency,
      t.status,
      t.type,
      t.description || '',
      t.feeAmount,
      t.createdAt.toISOString(),
      t.processedAt?.toISOString() || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Override search filters for transactions
  protected buildSearchFilters(query: string, additionalFilters: FilterOptions = {}): FilterOptions {
    return {
      ...additionalFilters,
      $or: [
        { description: { $like: `%${query}%` } },
        { externalOrderId: { $like: `%${query}%` } },
        { fromUserId: { $like: `%${query}%` } },
        { toUserId: { $like: `%${query}%` } },
        { id: isNaN(Number(query)) ? undefined : Number(query) }
      ].filter(filter => filter !== undefined)
    };
  }
}