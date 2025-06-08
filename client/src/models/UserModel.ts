import { BaseModel, ModelMetadata, ModelValidationSchema } from './BaseModel';

export interface UserAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  preferences?: Record<string, any>;
}

export class UserModel extends BaseModel {
  protected static metadata: ModelMetadata = {
    tableName: 'users',
    primaryKey: 'id',
    relationships: {
      transactions: {
        type: 'hasMany',
        model: 'Transaction',
        foreignKey: 'userId'
      },
      paymentMethods: {
        type: 'hasMany',
        model: 'PaymentMethod',
        foreignKey: 'userId'
      },
      notifications: {
        type: 'hasMany',
        model: 'Notification',
        foreignKey: 'userId'
      }
    }
  };

  protected static validationSchema: ModelValidationSchema = {
    id: {
      required: true,
      type: 'string',
      minLength: 1
    },
    email: {
      required: true,
      type: 'email',
      maxLength: 255
    },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]*$/
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]*$/
    },
    profileImageUrl: {
      type: 'string',
      maxLength: 500,
      pattern: /^https?:\/\/.+/
    },
    isAdmin: {
      type: 'boolean'
    },
    isActive: {
      type: 'boolean'
    }
  };

  protected getMetadata(): ModelMetadata {
    return UserModel.metadata;
  }

  protected getValidationSchema(): ModelValidationSchema {
    return UserModel.validationSchema;
  }

  // Getters for type safety
  get id(): string {
    return this.get<string>('id');
  }

  get email(): string {
    return this.get<string>('email');
  }

  get firstName(): string | undefined {
    return this.get<string>('firstName');
  }

  get lastName(): string | undefined {
    return this.get<string>('lastName');
  }

  get profileImageUrl(): string | undefined {
    return this.get<string>('profileImageUrl');
  }

  get isAdmin(): boolean {
    return this.get<boolean>('isAdmin') || false;
  }

  get isActive(): boolean {
    return this.get<boolean>('isActive') ?? true;
  }

  get createdAt(): Date | undefined {
    const date = this.get<string>('createdAt');
    return date ? new Date(date) : undefined;
  }

  get updatedAt(): Date | undefined {
    const date = this.get<string>('updatedAt');
    return date ? new Date(date) : undefined;
  }

  get lastLoginAt(): Date | undefined {
    const date = this.get<string>('lastLoginAt');
    return date ? new Date(date) : undefined;
  }

  get preferences(): Record<string, any> {
    return this.get<Record<string, any>>('preferences') || {};
  }

  // Setters for type safety
  set email(value: string) {
    this.set('email', value);
  }

  set firstName(value: string | undefined) {
    this.set('firstName', value);
  }

  set lastName(value: string | undefined) {
    this.set('lastName', value);
  }

  set profileImageUrl(value: string | undefined) {
    this.set('profileImageUrl', value);
  }

  set isAdmin(value: boolean) {
    this.set('isAdmin', value);
  }

  set isActive(value: boolean) {
    this.set('isActive', value);
  }

  set preferences(value: Record<string, any>) {
    this.set('preferences', value);
  }

  // User-specific methods
  getFullName(): string {
    const first = this.firstName;
    const last = this.lastName;
    
    if (first && last) {
      return `${first} ${last}`;
    }
    
    return first || last || this.email.split('@')[0];
  }

  getInitials(): string {
    const first = this.firstName;
    const last = this.lastName;
    
    if (first && last) {
      return `${first.charAt(0).toUpperCase()}${last.charAt(0).toUpperCase()}`;
    }
    
    if (first) {
      return first.charAt(0).toUpperCase();
    }
    
    return this.email.charAt(0).toUpperCase();
  }

  hasPermission(permission: string): boolean {
    if (this.isAdmin) {
      return true;
    }
    
    const userPermissions = this.preferences.permissions || [];
    return userPermissions.includes(permission);
  }

  updatePreference(key: string, value: any): this {
    const currentPrefs = this.preferences;
    this.preferences = {
      ...currentPrefs,
      [key]: value
    };
    return this;
  }

  getPreference(key: string, defaultValue: any = null): any {
    return this.preferences[key] ?? defaultValue;
  }

  async updateLastLogin(): Promise<this> {
    this.set('lastLoginAt', new Date().toISOString());
    return this.save();
  }

  isRecentlyActive(hours: number = 24): boolean {
    const lastLogin = this.lastLoginAt;
    if (!lastLogin) return false;
    
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    
    return lastLogin > hoursAgo;
  }

  // Static methods for user management
  static async findByEmail(email: string): Promise<UserModel | null> {
    return this.findOne({ filters: { email } });
  }

  static async findActiveUsers(): Promise<UserModel[]> {
    return this.findAll({ filters: { isActive: true } });
  }

  static async findAdmins(): Promise<UserModel[]> {
    return this.findAll({ filters: { isAdmin: true } });
  }

  static async searchUsers(query: string): Promise<UserModel[]> {
    return this.findAll({
      filters: {
        $or: [
          { email: { $like: `%${query}%` } },
          { firstName: { $like: `%${query}%` } },
          { lastName: { $like: `%${query}%` } }
        ]
      }
    });
  }

  static async getRecentlyActiveUsers(hours: number = 24): Promise<UserModel[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return this.findAll({
      filters: {
        lastLoginAt: { $gte: cutoff.toISOString() }
      },
      sort: 'lastLoginAt',
      order: 'desc'
    });
  }

  // User authentication helpers
  static async authenticate(email: string, password: string): Promise<UserModel | null> {
    // This would typically be handled by the AuthController
    // but we provide the model method for consistency
    try {
      const response = await this.apiRequest('/api/auth/login', 'POST', {
        email,
        password
      });
      
      return response ? new UserModel(response.user) : null;
    } catch (error) {
      return null;
    }
  }

  static async getCurrentUser(): Promise<UserModel | null> {
    try {
      const response = await this.apiRequest('/api/auth/user', 'GET');
      return response ? new UserModel(response) : null;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    await UserModel.apiRequest('/api/auth/logout', 'POST');
  }

  // Relationship loading methods
  async getTransactions(): Promise<any[]> {
    return this.loadRelation('transactions');
  }

  async getPaymentMethods(): Promise<any[]> {
    return this.loadRelation('paymentMethods');
  }

  async getNotifications(): Promise<any[]> {
    return this.loadRelation('notifications');
  }

  // Helper method for API requests (temporary until controller integration)
  private static async apiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    // This will be replaced by proper controller integration
    const { apiRequest } = await import('@/lib/queryClient');
    return apiRequest(endpoint, method, data);
  }

  // Profile management
  async updateProfile(profileData: Partial<UserAttributes>): Promise<this> {
    // Validate profile data
    const allowedFields = ['firstName', 'lastName', 'profileImageUrl'];
    const updates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (field in profileData) {
        updates[field] = profileData[field as keyof UserAttributes];
      }
    }
    
    this.setAttributes(updates);
    return this.save();
  }

  async deactivate(): Promise<this> {
    this.isActive = false;
    return this.save();
  }

  async activate(): Promise<this> {
    this.isActive = true;
    return this.save();
  }

  // Data export/import
  exportData(): UserAttributes {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      profileImageUrl: this.profileImageUrl,
      isAdmin: this.isAdmin,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
      preferences: this.preferences
    };
  }

  static createFromImport(data: UserAttributes): UserModel {
    return new UserModel(data);
  }
}