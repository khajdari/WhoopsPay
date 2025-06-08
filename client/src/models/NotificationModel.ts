import { BaseModel, ModelMetadata, ModelValidationSchema } from './BaseModel';

export interface NotificationAttributes {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security' | 'system';
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
}

export class NotificationModel extends BaseModel {
  protected static metadata: ModelMetadata = {
    tableName: 'notifications',
    primaryKey: 'id',
    relationships: {
      user: {
        type: 'belongsTo',
        model: 'User',
        foreignKey: 'userId'
      }
    }
  };

  protected static validationSchema: ModelValidationSchema = {
    userId: {
      required: true,
      type: 'string',
      minLength: 1
    },
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255
    },
    message: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 1000
    },
    type: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        const validTypes = ['info', 'success', 'warning', 'error', 'transaction', 'security', 'system'];
        return validTypes.includes(value) ? null : 'Invalid notification type';
      }
    },
    priority: {
      required: true,
      type: 'string',
      custom: (value: string) => {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        return validPriorities.includes(value) ? null : 'Invalid priority level';
      }
    },
    actionUrl: {
      type: 'string',
      maxLength: 500,
      pattern: /^https?:\/\/.+/
    },
    actionText: {
      type: 'string',
      maxLength: 50
    }
  };

  protected getMetadata(): ModelMetadata {
    return NotificationModel.metadata;
  }

  protected getValidationSchema(): ModelValidationSchema {
    return NotificationModel.validationSchema;
  }

  // Getters
  get id(): number {
    return this.get<number>('id');
  }

  get userId(): string {
    return this.get<string>('userId');
  }

  get title(): string {
    return this.get<string>('title');
  }

  get message(): string {
    return this.get<string>('message');
  }

  get type(): 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security' | 'system' {
    return this.get<'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security' | 'system'>('type');
  }

  get isRead(): boolean {
    return this.get<boolean>('isRead') || false;
  }

  get isArchived(): boolean {
    return this.get<boolean>('isArchived') || false;
  }

  get priority(): 'low' | 'medium' | 'high' | 'urgent' {
    return this.get<'low' | 'medium' | 'high' | 'urgent'>('priority');
  }

  get actionUrl(): string | undefined {
    return this.get<string>('actionUrl');
  }

  get actionText(): string | undefined {
    return this.get<string>('actionText');
  }

  get expiresAt(): Date | undefined {
    const date = this.get<string>('expiresAt');
    return date ? new Date(date) : undefined;
  }

  get createdAt(): Date {
    return new Date(this.get<string>('createdAt'));
  }

  get readAt(): Date | undefined {
    const date = this.get<string>('readAt');
    return date ? new Date(date) : undefined;
  }

  get metadata(): Record<string, any> {
    return this.get<Record<string, any>>('metadata') || {};
  }

  // Setters
  set title(value: string) {
    this.set('title', value);
  }

  set message(value: string) {
    this.set('message', value);
  }

  set type(value: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security' | 'system') {
    this.set('type', value);
  }

  set isRead(value: boolean) {
    this.set('isRead', value);
    if (value && !this.readAt) {
      this.set('readAt', new Date());
    }
  }

  set isArchived(value: boolean) {
    this.set('isArchived', value);
  }

  set priority(value: 'low' | 'medium' | 'high' | 'urgent') {
    this.set('priority', value);
  }

  set actionUrl(value: string | undefined) {
    this.set('actionUrl', value);
  }

  set actionText(value: string | undefined) {
    this.set('actionText', value);
  }

  set expiresAt(value: Date | undefined) {
    this.set('expiresAt', value);
  }

  set metadata(value: Record<string, any>) {
    this.set('metadata', value);
  }

  // Status checking methods
  isUnread(): boolean {
    return !this.isRead;
  }

  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  isActive(): boolean {
    return !this.isArchived && !this.isExpired();
  }

  isUrgent(): boolean {
    return this.priority === 'urgent';
  }

  isHighPriority(): boolean {
    return this.priority === 'high' || this.priority === 'urgent';
  }

  hasAction(): boolean {
    return !!(this.actionUrl && this.actionText);
  }

  // Action methods
  async markAsRead(): Promise<this> {
    this.isRead = true;
    return this.save();
  }

  async markAsUnread(): Promise<this> {
    this.isRead = false;
    this.set('readAt', undefined);
    return this.save();
  }

  async archive(): Promise<this> {
    this.isArchived = true;
    return this.save();
  }

  async unarchive(): Promise<this> {
    this.isArchived = false;
    return this.save();
  }

  // Utility methods
  getTypeIcon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'transaction': return '💳';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      default: return 'ℹ️';
    }
  }

  getTypeColor(): string {
    switch (this.type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'transaction': return 'blue';
      case 'security': return 'purple';
      case 'system': return 'gray';
      default: return 'blue';
    }
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'gray';
    }
  }

  getAgeInMinutes(): number {
    return Math.floor((new Date().getTime() - this.createdAt.getTime()) / (1000 * 60));
  }

  getFormattedAge(): string {
    const minutes = this.getAgeInMinutes();
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }

  // Static methods for querying
  static async findByUser(userId: string): Promise<NotificationModel[]> {
    return this.findAll({
      filters: { userId, isArchived: false },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findUnreadByUser(userId: string): Promise<NotificationModel[]> {
    return this.findAll({
      filters: { userId, isRead: false, isArchived: false },
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findByType(type: string, userId?: string): Promise<NotificationModel[]> {
    const filters: any = { type, isArchived: false };
    if (userId) filters.userId = userId;
    
    return this.findAll({
      filters,
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findByPriority(priority: string, userId?: string): Promise<NotificationModel[]> {
    const filters: any = { priority, isArchived: false };
    if (userId) filters.userId = userId;
    
    return this.findAll({
      filters,
      sort: 'createdAt',
      order: 'desc'
    });
  }

  static async findExpired(): Promise<NotificationModel[]> {
    return this.findAll({
      filters: {
        expiresAt: { $lt: new Date() },
        isArchived: false
      }
    });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const unread = await this.findUnreadByUser(userId);
    return unread.length;
  }

  // Bulk operations
  static async markAllAsReadForUser(userId: string): Promise<void> {
    const unreadNotifications = await this.findUnreadByUser(userId);
    await Promise.all(unreadNotifications.map(n => n.markAsRead()));
  }

  static async archiveOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldNotifications = await this.findAll({
      filters: {
        createdAt: { $lt: cutoffDate },
        isArchived: false
      }
    });
    
    await Promise.all(oldNotifications.map(n => n.archive()));
  }

  // Factory methods
  static createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): NotificationModel {
    return new NotificationModel({
      userId,
      title,
      message,
      type: 'system',
      priority,
      isRead: false,
      isArchived: false,
      createdAt: new Date()
    });
  }

  static createTransactionNotification(
    userId: string,
    title: string,
    message: string,
    transactionId: number,
    actionUrl?: string
  ): NotificationModel {
    return new NotificationModel({
      userId,
      title,
      message,
      type: 'transaction',
      priority: 'medium',
      isRead: false,
      isArchived: false,
      actionUrl,
      actionText: actionUrl ? 'View Transaction' : undefined,
      createdAt: new Date(),
      metadata: {
        transactionId
      }
    });
  }

  static createSecurityNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'high' | 'urgent' = 'high'
  ): NotificationModel {
    return new NotificationModel({
      userId,
      title,
      message,
      type: 'security',
      priority,
      isRead: false,
      isArchived: false,
      createdAt: new Date()
    });
  }

  static createPaymentNotification(
    userId: string,
    title: string,
    message: string,
    amount: number,
    paymentMethodId?: number
  ): NotificationModel {
    return new NotificationModel({
      userId,
      title,
      message,
      type: 'transaction',
      priority: 'medium',
      isRead: false,
      isArchived: false,
      createdAt: new Date(),
      metadata: {
        amount,
        paymentMethodId
      }
    });
  }

  // Relationship loading
  async getUser(): Promise<any> {
    return this.loadRelation('user');
  }

  // Data export/import
  exportData(): NotificationAttributes {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      isRead: this.isRead,
      isArchived: this.isArchived,
      priority: this.priority,
      actionUrl: this.actionUrl,
      actionText: this.actionText,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      readAt: this.readAt,
      metadata: this.metadata
    };
  }

  static createFromImport(data: NotificationAttributes): NotificationModel {
    return new NotificationModel(data);
  }
}