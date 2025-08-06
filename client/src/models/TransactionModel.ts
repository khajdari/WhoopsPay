import { BaseModel, ModelMetadata, ModelValidationSchema } from './BaseModel';

export interface TransactionAttributes {
  id: number;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  type: 'transfer' | 'payment' | 'withdrawal' | 'deposit' | 'external';
  feeAmount?: number;
  externalOrderId?: string;
  externalSource?: string;
  returnUrl?: string;
  cancelUrl?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class TransactionModel extends BaseModel {
  protected static metadata: ModelMetadata = {
    tableName: 'transactions',
    primaryKey: 'id',
    relationships: {
      fromUser: {
        type: 'belongsTo',
        model: 'User',
        foreignKey: 'fromUserId'
      },
      toUser: {
        type: 'belongsTo',
        model: 'User',
        foreignKey: 'toUserId'
      }
    }
  };

  protected static validationSchema: ModelValidationSchema = {
    fromUserId: {
      required: true,
      type: 'string',
      minLength: 1
    },
    toUserId: {
      required: true,
      type: 'string',
      minLength: 1
    },
    amount: {
      required: true,
      type: 'number',
      min: 0.01,
      max: 1000000
    },
    currency: {
      required: true,
      type: 'string',
      pattern: /^[A-Z]{3}$/
    },
    status: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
        return validStatuses.includes(value) ? null : 'Invalid status';
      }
    },
    type: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        const validTypes = ['transfer', 'payment', 'withdrawal', 'deposit', 'external'];
        return validTypes.includes(value) ? null : 'Invalid transaction type';
      }
    },
    description: {
      type: 'string',
      maxLength: 500
    },
    feeAmount: {
      type: 'number',
      min: 0
    }
  };

  protected getMetadata(): ModelMetadata {
    return TransactionModel.metadata;
  }

  protected getValidationSchema(): ModelValidationSchema {
    return TransactionModel.validationSchema;
  }

  // Getters
  get id(): number {
    return this.get<number>('id');
  }

  get fromUserId(): string {
    return this.get<string>('fromUserId');
  }

  get toUserId(): string {
    return this.get<string>('toUserId');
  }

  get amount(): number {
    return this.get<number>('amount');
  }

  get currency(): string {
    return this.get<string>('currency');
  }

  get status(): string {
    return this.get<string>('status');
  }

  get description(): string | undefined {
    return this.get<string>('description');
  }

  get type(): string {
    return this.get<string>('type');
  }

  get feeAmount(): number {
    return this.get<number>('feeAmount') || 0;
  }

  get totalAmount(): number {
    return this.amount + this.feeAmount;
  }

  get externalOrderId(): string | undefined {
    return this.get<string>('externalOrderId');
  }

  get externalSource(): string | undefined {
    return this.get<string>('externalSource');
  }

  get returnUrl(): string | undefined {
    return this.get<string>('returnUrl');
  }

  get cancelUrl(): string | undefined {
    return this.get<string>('cancelUrl');
  }

  get processedAt(): Date | undefined {
    const date = this.get<string>('processedAt');
    return date ? new Date(date) : undefined;
  }

  get createdAt(): Date {
    return new Date(this.get<string>('createdAt'));
  }

  get updatedAt(): Date | undefined {
    const date = this.get<string>('updatedAt');
    return date ? new Date(date) : undefined;
  }

  get metadata(): Record<string, any> {
    return this.get<Record<string, any>>('metadata') || {};
  }

  // Setters
  set amount(value: number) {
    this.set('amount', value);
  }

  set status(value: string) {
    this.set('status', value);
  }

  set description(value: string | undefined) {
    this.set('description', value);
  }

  set feeAmount(value: number) {
    this.set('feeAmount', value);
  }

  set metadata(value: Record<string, any>) {
    this.set('metadata', value);
  }

  // Status checking methods
  isPending(): boolean {
    return this.status === 'pending';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  isExternal(): boolean {
    return this.type === 'external' || !!this.externalSource;
  }

  canBeCancelled(): boolean {
    return this.isPending() && !this.isExternal();
  }

  canBeRefunded(): boolean {
    return this.isCompleted() && this.type !== 'withdrawal';
  }

  // Transaction direction methods
  isIncoming(userId: string): boolean {
    return this.toUserId === userId;
  }

  isOutgoing(userId: string): boolean {
    return this.fromUserId === userId;
  }

  getDirection(userId: string): 'incoming' | 'outgoing' | 'internal' {
    if (this.isIncoming(userId)) return 'incoming';
    if (this.isOutgoing(userId)) return 'outgoing';
    return 'internal';
  }

  getOtherPartyId(userId: string): string {
    return this.isIncoming(userId) ? this.fromUserId : this.toUserId;
  }

  // Amount formatting
  formatAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }

  formatTotalAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.totalAmount);
  }

  formatFeeAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.feeAmount);
  }

  // Status operations
  async markAsCompleted(): Promise<this> {
    if (!this.isPending()) {
      throw new Error('Only pending transactions can be completed');
    }
    
    this.status = 'completed';
    this.set('processedAt', new Date().toISOString());
    return this.save();
  }

  async markAsFailed(reason?: string): Promise<this> {
    if (!this.isPending()) {
      throw new Error('Only pending transactions can be marked as failed');
    }
    
    this.status = 'failed';
    this.set('processedAt', new Date().toISOString());
    
    if (reason) {
      const currentMetadata = this.metadata;
      this.metadata = {
        ...currentMetadata,
        failureReason: reason
      };
    }
    
    return this.save();
  }

  async cancel(reason?: string): Promise<this> {
    if (!this.canBeCancelled()) {
      throw new Error('Transaction cannot be cancelled');
    }
    
    this.status = 'cancelled';
    this.set('processedAt', new Date().toISOString());
    
    if (reason) {
      const currentMetadata = this.metadata;
      this.metadata = {
        ...currentMetadata,
        cancellationReason: reason
      };
    }
    
    return this.save();
  }

  // Static query methods
  static async findByUser(userId: string): Promise<TransactionModel[]> {
    return this.findAll({
      filters: {
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findByStatus(status: string): Promise<TransactionModel[]> {
    return this.findAll({
      filters: { status },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findPending(): Promise<TransactionModel[]> {
    return this.findByStatus('pending');
  }

  static async findExternal(): Promise<TransactionModel[]> {
    return this.findAll({
      filters: {
        $or: [
          { type: 'external' },
          { externalSource: { $ne: null } }
        ]
      },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findByAmountRange(min: number, max: number): Promise<TransactionModel[]> {
    return this.findAll({
      filters: {
        amount: {
          $gte: min,
          $lte: max
        }
      }
    });
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<TransactionModel[]> {
    return this.findAll({
      filters: {
        createdAt: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async getTransactionStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    totalVolume: number;
  }> {
    const [total, pending, completed, failed] = await Promise.all([
      this.count(),
      this.count({ filters: { status: 'pending' } }),
      this.count({ filters: { status: 'completed' } }),
      this.count({ filters: { status: 'failed' } })
    ]);

    // Calculate total volume (this would be more efficient with a database aggregate)
    const completedTransactions = await this.findByStatus('completed');
    const totalVolume = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      total,
      pending,
      completed,
      failed,
      totalVolume
    };
  }

  // Search and filtering
  static async search(query: string): Promise<TransactionModel[]> {
    return this.findAll({
      filters: {
        $or: [
          { description: { $like: `%${query}%` } },
          { externalOrderId: { $like: `%${query}%` } },
          { fromUserId: { $like: `%${query}%` } },
          { toUserId: { $like: `%${query}%` } }
        ]
      }
    });
  }

  // Relationship loading
  async getFromUser(): Promise<any> {
    return this.loadRelation('fromUser');
  }

  async getToUser(): Promise<any> {
    return this.loadRelation('toUser');
  }

  // Export/Import
  exportData(): TransactionAttributes {
    return {
      id: this.id,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      amount: this.amount,
      currency: this.currency,
      status: this.status as any,
      description: this.description,
      type: this.type as any,
      feeAmount: this.feeAmount,
      externalOrderId: this.externalOrderId,
      externalSource: this.externalSource,
      returnUrl: this.returnUrl,
      cancelUrl: this.cancelUrl,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }

  static createFromImport(data: TransactionAttributes): TransactionModel {
    return new TransactionModel(data);
  }

  // Transaction creation helpers
  static createTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string = 'GCU',
    description?: string
  ): TransactionModel {
    return new TransactionModel({
      fromUserId,
      toUserId,
      amount,
      currency,
      status: 'pending',
      type: 'transfer',
      description,
      createdAt: new Date()
    });
  }

  static createExternalPayment(
    fromUserId: string,
    toUserId: string,
    amount: number,
    orderId: string,
    source: string,
    returnUrl?: string,
    cancelUrl?: string
  ): TransactionModel {
    return new TransactionModel({
      fromUserId,
      toUserId,
      amount,
      currency: 'GCU',
      status: 'pending',
      type: 'external',
      externalOrderId: orderId,
      externalSource: source,
      returnUrl,
      cancelUrl,
      createdAt: new Date()
    });
  }
}