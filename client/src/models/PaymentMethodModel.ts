import { BaseModel, ModelMetadata, ModelValidationSchema } from './BaseModel';

export interface PaymentMethodAttributes {
  id: number;
  userId: string;
  type: 'card' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  accountType?: string;
  holderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class PaymentMethodModel extends BaseModel {
  protected static metadata: ModelMetadata = {
    tableName: 'payment_methods',
    primaryKey: 'id',
    relationships: {
      user: {
        type: 'belongsTo',
        model: 'User',
        foreignKey: 'userId'
      },
      transactions: {
        type: 'hasMany',
        model: 'Transaction',
        foreignKey: 'paymentMethodId'
      }
    }
  };

  protected static validationSchema: ModelValidationSchema = {
    userId: {
      required: true,
      type: 'string',
      minLength: 1
    },
    type: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        const validTypes = ['card', 'bank'];
        return validTypes.includes(value) ? null : 'Invalid payment method type';
      }
    },
    last4: {
      type: 'string',
      pattern: /^\d{4}$/,
      custom: (value: string) => {
        return value && !/^\d{4}$/.test(value) ? 'Last 4 digits must be exactly 4 numbers' : null;
      }
    },
    brand: {
      type: 'string',
      maxLength: 50
    },
    expiryMonth: {
      type: 'number',
      min: 1,
      max: 12
    },
    expiryYear: {
      type: 'number',
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 20
    },
    accountNumber: {
      type: 'string',
      minLength: 4,
      maxLength: 17,
      pattern: /^\d+$/
    },
    routingNumber: {
      type: 'string',
      pattern: /^\d{9}$/
    },
    bankName: {
      type: 'string',
      maxLength: 100
    },
    holderName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/
    }
  };

  protected getMetadata(): ModelMetadata {
    return PaymentMethodModel.metadata;
  }

  protected getValidationSchema(): ModelValidationSchema {
    return PaymentMethodModel.validationSchema;
  }

  // Getters
  get id(): number {
    return this.get<number>('id');
  }

  get userId(): string {
    return this.get<string>('userId');
  }

  get type(): 'card' | 'bank' {
    return this.get<'card' | 'bank'>('type');
  }

  get last4(): string | undefined {
    return this.get<string>('last4');
  }

  get brand(): string | undefined {
    return this.get<string>('brand');
  }

  get expiryMonth(): number | undefined {
    return this.get<number>('expiryMonth');
  }

  get expiryYear(): number | undefined {
    return this.get<number>('expiryYear');
  }

  get accountNumber(): string | undefined {
    return this.get<string>('accountNumber');
  }

  get routingNumber(): string | undefined {
    return this.get<string>('routingNumber');
  }

  get bankName(): string | undefined {
    return this.get<string>('bankName');
  }

  get accountType(): string | undefined {
    return this.get<string>('accountType');
  }

  get holderName(): string | undefined {
    return this.get<string>('holderName');
  }

  get isDefault(): boolean {
    return this.get<boolean>('isDefault') || false;
  }

  get isActive(): boolean {
    return this.get<boolean>('isActive') ?? true;
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
  set type(value: 'card' | 'bank') {
    this.set('type', value);
  }

  set last4(value: string | undefined) {
    this.set('last4', value);
  }

  set brand(value: string | undefined) {
    this.set('brand', value);
  }

  set expiryMonth(value: number | undefined) {
    this.set('expiryMonth', value);
  }

  set expiryYear(value: number | undefined) {
    this.set('expiryYear', value);
  }

  set accountNumber(value: string | undefined) {
    this.set('accountNumber', value);
  }

  set routingNumber(value: string | undefined) {
    this.set('routingNumber', value);
  }

  set bankName(value: string | undefined) {
    this.set('bankName', value);
  }

  set accountType(value: string | undefined) {
    this.set('accountType', value);
  }

  set holderName(value: string | undefined) {
    this.set('holderName', value);
  }

  set isDefault(value: boolean) {
    this.set('isDefault', value);
  }

  set isActive(value: boolean) {
    this.set('isActive', value);
  }

  set metadata(value: Record<string, any>) {
    this.set('metadata', value);
  }

  // Card-specific methods
  isCard(): boolean {
    return this.type === 'card';
  }

  isBank(): boolean {
    return this.type === 'bank';
  }

  isExpired(): boolean {
    if (!this.isCard() || !this.expiryMonth || !this.expiryYear) {
      return false;
    }

    const now = new Date();
    const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 1);
    return now > expiry;
  }

  isExpiringSoon(monthsThreshold: number = 3): boolean {
    if (!this.isCard() || !this.expiryMonth || !this.expiryYear) {
      return false;
    }

    const now = new Date();
    const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 1);
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + monthsThreshold);

    return expiry < threshold && expiry > now;
  }

  getExpiryStatus(): 'valid' | 'expiring' | 'expired' {
    if (this.isExpired()) return 'expired';
    if (this.isExpiringSoon()) return 'expiring';
    return 'valid';
  }

  formatDisplayName(): string {
    if (this.isCard()) {
      const brand = this.brand ? this.brand.charAt(0).toUpperCase() + this.brand.slice(1) : 'Card';
      return `${brand} ****${this.last4}`;
    }

    if (this.isBank()) {
      const bankName = this.bankName || 'Bank Account';
      return `${bankName} ****${this.accountNumber?.slice(-4)}`;
    }

    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  getBrandIcon(): string {
    if (this.isCard()) {
      switch (this.brand?.toLowerCase()) {
        case 'visa': return '💳';
        case 'mastercard': return '💳';
        case 'amex': return '💳';
        case 'discover': return '💳';
        default: return '💳';
      }
    }
    return '🏦';
  }

  // Validation methods
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
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

  detectCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }

  // Security methods
  maskSensitiveData(): PaymentMethodAttributes {
    const data = this.exportData();
    
    if (data.accountNumber) {
      data.accountNumber = `****${data.accountNumber.slice(-4)}`;
    }
    
    if (data.routingNumber) {
      data.routingNumber = '****';
    }
    
    return data;
  }

  // Default payment method management
  async setAsDefault(): Promise<this> {
    // First, unset any existing default for this user
    const existingDefaults = await PaymentMethodModel.findAll({
      filters: { userId: this.userId, isDefault: true }
    });

    for (const existing of existingDefaults) {
      if (existing.id !== this.id) {
        existing.isDefault = false;
        await existing.save();
      }
    }

    // Set this as default
    this.isDefault = true;
    return this.save();
  }

  async unsetAsDefault(): Promise<this> {
    this.isDefault = false;
    return this.save();
  }

  // Activity management
  async deactivate(): Promise<this> {
    this.isActive = false;
    return this.save();
  }

  async activate(): Promise<this> {
    this.isActive = true;
    return this.save();
  }

  // Static methods for querying
  static async findByUser(userId: string): Promise<PaymentMethodModel[]> {
    return this.findAll({
      filters: { userId, isActive: true },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findDefault(userId: string): Promise<PaymentMethodModel | null> {
    return this.findOne({
      filters: { userId, isDefault: true, isActive: true }
    });
  }

  static async findByType(userId: string, type: 'card' | 'bank'): Promise<PaymentMethodModel[]> {
    return this.findAll({
      filters: { userId, type, isActive: true }
    });
  }

  static async findExpiring(monthsThreshold: number = 3): Promise<PaymentMethodModel[]> {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + monthsThreshold);
    
    return this.findAll({
      filters: {
        type: 'card',
        isActive: true,
        $and: [
          { expiryYear: { $lte: threshold.getFullYear() } },
          { expiryMonth: { $lte: threshold.getMonth() + 1 } }
        ]
      }
    });
  }

  static async findExpired(): Promise<PaymentMethodModel[]> {
    const now = new Date();
    
    return this.findAll({
      filters: {
        type: 'card',
        $or: [
          { expiryYear: { $lt: now.getFullYear() } },
          {
            $and: [
              { expiryYear: now.getFullYear() },
              { expiryMonth: { $lt: now.getMonth() + 1 } }
            ]
          }
        ]
      }
    });
  }

  // Relationship loading
  async getUser(): Promise<any> {
    return this.loadRelation('user');
  }

  async getTransactions(): Promise<any[]> {
    return this.loadRelation('transactions');
  }

  // Data export/import
  exportData(): PaymentMethodAttributes {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      last4: this.last4,
      brand: this.brand,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      accountNumber: this.accountNumber,
      routingNumber: this.routingNumber,
      bankName: this.bankName,
      accountType: this.accountType,
      holderName: this.holderName,
      isDefault: this.isDefault,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }

  static createFromImport(data: PaymentMethodAttributes): PaymentMethodModel {
    return new PaymentMethodModel(data);
  }

  // Factory methods
  static createCard(
    userId: string,
    cardNumber: string,
    expiryMonth: number,
    expiryYear: number,
    cvv: string,
    holderName?: string
  ): PaymentMethodModel {
    const brand = PaymentMethodModel.prototype.detectCardBrand(cardNumber);
    const last4 = cardNumber.slice(-4);

    return new PaymentMethodModel({
      userId,
      type: 'card',
      last4,
      brand,
      expiryMonth,
      expiryYear,
      holderName,
      isActive: true,
      createdAt: new Date(),
      metadata: {
        cvvVerified: true // In real implementation, verify with payment processor
      }
    });
  }

  static createBankAccount(
    userId: string,
    accountNumber: string,
    routingNumber: string,
    bankName: string,
    accountType?: string,
    holderName?: string
  ): PaymentMethodModel {
    return new PaymentMethodModel({
      userId,
      type: 'bank',
      accountNumber,
      routingNumber,
      bankName,
      accountType,
      holderName,
      isActive: true,
      createdAt: new Date(),
      metadata: {
        verified: false // Require micro-deposit verification
      }
    });
  }
}