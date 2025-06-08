import { BaseController, ControllerResponse, FilterOptions, PaginationOptions, ControllerOptions } from './BaseController';
import { UserModel } from '../models/UserModel';
import { TransactionModel } from '../models/TransactionModel';
import { PaymentMethodModel } from '../models/PaymentMethodModel';
import { NotificationModel } from '../models/NotificationModel';

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    adminCount: number;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    totalVolume: number;
    monthlyVolume: number;
  };
  system: {
    uptime: number;
    errorRate: number;
    activeConnections: number;
    systemLoad: number;
  };
  security: {
    flaggedTransactions: number;
    suspiciousUsers: number;
    failedLogins: number;
    securityAlerts: number;
  };
}

export interface UserManagementFilters extends FilterOptions {
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  isAdmin?: boolean;
  lastLoginDate?: string;
  registrationDate?: string;
}

export interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'error' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export class AdminController extends BaseController {
  protected getModelClass() {
    return UserModel;
  }

  // Dashboard and statistics
  async getDashboardStats(options: ControllerOptions = {}): Promise<ControllerResponse<AdminDashboardStats>> {
    try {
      const cacheKey = this.generateCacheKey('adminDashboard');
      
      if (options.cache !== false) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return this.createSuccessResponse(cached);
        }
      }

      // Gather statistics from all models
      const [users, transactions, notifications] = await Promise.all([
        UserModel.findAll(),
        TransactionModel.findAll(),
        NotificationModel.findAll()
      ]);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate user statistics
      const userStats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        newThisMonth: users.filter(u => u.createdAt >= monthStart).length,
        adminCount: users.filter(u => u.isAdmin).length
      };

      // Calculate transaction statistics
      const completedTransactions = transactions.filter(t => t.isCompleted());
      const monthlyTransactions = transactions.filter(t => t.createdAt >= monthStart);
      
      const transactionStats = {
        total: transactions.length,
        pending: transactions.filter(t => t.isPending()).length,
        completed: completedTransactions.length,
        failed: transactions.filter(t => t.isFailed()).length,
        totalVolume: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
        monthlyVolume: monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)
      };

      // System statistics (would be gathered from system metrics in production)
      const systemStats = {
        uptime: Date.now() - (global as any).startTime || 0,
        errorRate: 0.02, // 2% error rate
        activeConnections: Math.floor(Math.random() * 100) + 50,
        systemLoad: Math.random() * 0.8 + 0.1 // 10-90% load
      };

      // Security statistics
      const securityStats = {
        flaggedTransactions: transactions.filter(t => this.isTransactionFlagged(t)).length,
        suspiciousUsers: users.filter(u => this.isUserSuspicious(u)).length,
        failedLogins: 0, // Would be tracked in audit logs
        securityAlerts: notifications.filter(n => n.type === 'security').length
      };

      const stats: AdminDashboardStats = {
        users: userStats,
        transactions: transactionStats,
        system: systemStats,
        security: securityStats
      };

      // Cache for 5 minutes
      if (options.cache !== false) {
        this.setCache(cacheKey, stats, 5 * 60 * 1000);
      }

      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // User management
  async getUsers(
    filters: UserManagementFilters = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      return await this.findAll(filters, pagination, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async getUserDetails(userId: string, options: ControllerOptions = {}): Promise<ControllerResponse> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return this.createErrorResponse(new Error('User not found'));
      }

      // Get user's related data
      const [transactions, paymentMethods, notifications] = await Promise.all([
        TransactionModel.findByUser(userId),
        PaymentMethodModel.findByUser(userId),
        NotificationModel.findByUser(userId)
      ]);

      const userDetails = {
        ...user.exportData(),
        statistics: {
          totalTransactions: transactions.length,
          totalSpent: transactions
            .filter(t => t.isOutgoing(userId) && t.isCompleted())
            .reduce((sum, t) => sum + t.amount, 0),
          totalReceived: transactions
            .filter(t => t.isIncoming(userId) && t.isCompleted())
            .reduce((sum, t) => sum + t.amount, 0),
          paymentMethodsCount: paymentMethods.length,
          unreadNotifications: notifications.filter(n => n.isUnread()).length
        },
        recentTransactions: transactions.slice(0, 10).map(t => t.exportData()),
        paymentMethods: paymentMethods.map(pm => pm.maskSensitiveData()),
        flags: this.getUserFlags(user, transactions)
      };

      return this.createSuccessResponse(userDetails);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended',
    reason?: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return this.createErrorResponse(new Error('User not found'));
      }

      // Update user status
      user.isActive = status === 'active';
      
      // Add status change to metadata
      const currentMetadata = user.metadata;
      user.metadata = {
        ...currentMetadata,
        statusHistory: [
          ...(currentMetadata.statusHistory || []),
          {
            status,
            reason,
            changedAt: new Date(),
            changedBy: options.adminUserId || 'system'
          }
        ]
      };

      await user.save();

      // Create notification for user
      if (status === 'suspended') {
        const notification = NotificationModel.createSecurityNotification(
          userId,
          'Account Suspended',
          reason || 'Your account has been suspended. Please contact support.',
          'urgent'
        );
        await notification.save();
      }

      // Log audit entry
      await this.logAuditEntry({
        userId: options.adminUserId || 'system',
        action: 'user_status_update',
        resource: 'user',
        resourceId: userId,
        details: { oldStatus: user.isActive ? 'active' : 'inactive', newStatus: status, reason },
        ipAddress: options.ipAddress || 'unknown',
        userAgent: options.userAgent || 'unknown',
        timestamp: new Date(),
        success: true
      });

      return this.createSuccessResponse(
        user.exportData(),
        undefined,
        `User status updated to ${status}`
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async promoteToAdmin(
    userId: string,
    adminUserId: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return this.createErrorResponse(new Error('User not found'));
      }

      if (user.isAdmin) {
        return this.createErrorResponse(new Error('User is already an admin'));
      }

      user.isAdmin = true;
      
      // Add promotion to metadata
      const currentMetadata = user.metadata;
      user.metadata = {
        ...currentMetadata,
        adminPromotions: [
          ...(currentMetadata.adminPromotions || []),
          {
            promotedAt: new Date(),
            promotedBy: adminUserId,
            reason: 'Admin promotion'
          }
        ]
      };

      await user.save();

      // Create notification
      const notification = NotificationModel.createSystemNotification(
        userId,
        'Admin Access Granted',
        'You have been granted administrator privileges.',
        'high'
      );
      await notification.save();

      // Log audit entry
      await this.logAuditEntry({
        userId: adminUserId,
        action: 'user_promote_admin',
        resource: 'user',
        resourceId: userId,
        details: { promotedUser: user.email },
        ipAddress: options.ipAddress || 'unknown',
        userAgent: options.userAgent || 'unknown',
        timestamp: new Date(),
        success: true
      });

      return this.createSuccessResponse(
        user.exportData(),
        undefined,
        'User promoted to admin successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Transaction management
  async getTransactionDetails(
    transactionId: number,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const transaction = await TransactionModel.findById(transactionId);
      if (!transaction) {
        return this.createErrorResponse(new Error('Transaction not found'));
      }

      const [fromUser, toUser] = await Promise.all([
        UserModel.findById(transaction.fromUserId),
        UserModel.findById(transaction.toUserId)
      ]);

      const transactionDetails = {
        ...transaction.exportData(),
        fromUser: fromUser?.exportData(),
        toUser: toUser?.exportData(),
        flags: this.getTransactionFlags(transaction),
        riskScore: this.calculateTransactionRiskScore(transaction)
      };

      return this.createSuccessResponse(transactionDetails);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async flagTransaction(
    transactionId: number,
    reason: string,
    adminUserId: string,
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const transaction = await TransactionModel.findById(transactionId);
      if (!transaction) {
        return this.createErrorResponse(new Error('Transaction not found'));
      }

      // Add flag to transaction metadata
      const currentMetadata = transaction.metadata;
      transaction.metadata = {
        ...currentMetadata,
        flags: [
          ...(currentMetadata.flags || []),
          {
            reason,
            flaggedAt: new Date(),
            flaggedBy: adminUserId,
            resolved: false
          }
        ]
      };

      await transaction.save();

      // Log audit entry
      await this.logAuditEntry({
        userId: adminUserId,
        action: 'transaction_flag',
        resource: 'transaction',
        resourceId: transactionId.toString(),
        details: { reason },
        ipAddress: options.ipAddress || 'unknown',
        userAgent: options.userAgent || 'unknown',
        timestamp: new Date(),
        success: true
      });

      return this.createSuccessResponse(
        transaction.exportData(),
        undefined,
        'Transaction flagged successfully'
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // System monitoring
  async getSystemAlerts(
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse<SystemAlert[]>> {
    try {
      // In production, this would query a dedicated alerts system
      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert_1',
          type: 'security',
          severity: 'high',
          title: 'Unusual Transaction Pattern Detected',
          description: 'Multiple large transactions from the same IP address',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          resolved: false
        },
        {
          id: 'alert_2',
          type: 'performance',
          severity: 'medium',
          title: 'Database Query Performance Degraded',
          description: 'Query response times increased by 30%',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          resolved: true,
          resolvedBy: 'system',
          resolvedAt: new Date(Date.now() - 3600000)
        }
      ];

      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;
      
      const paginatedAlerts = mockAlerts.slice(offset, offset + limit);

      return this.createSuccessResponse(
        paginatedAlerts,
        {
          total: mockAlerts.length,
          page,
          limit,
          hasNext: mockAlerts.length > offset + limit,
          hasPrevious: page > 1
        }
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async getAuditLogs(
    filters: FilterOptions = {},
    pagination: PaginationOptions = {},
    options: ControllerOptions = {}
  ): Promise<ControllerResponse<AuditLogEntry[]>> {
    try {
      // In production, this would query the audit log database
      const mockLogs: AuditLogEntry[] = [
        {
          id: 'log_1',
          userId: '@admin_maria',
          action: 'user_status_update',
          resource: 'user',
          resourceId: '@james_chen',
          details: { oldStatus: 'active', newStatus: 'suspended', reason: 'Suspicious activity' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(),
          success: true
        }
      ];

      return this.createSuccessResponse(mockLogs);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Notification management
  async sendSystemNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const notifications = userIds.map(userId => 
        NotificationModel.createSystemNotification(userId, title, message, priority)
      );

      // Save all notifications
      await Promise.all(notifications.map(n => n.save()));

      return this.createSuccessResponse(
        { sent: notifications.length, userIds },
        undefined,
        `System notification sent to ${notifications.length} users`
      );
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  async broadcastNotification(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      // Get all active users
      const users = await UserModel.findAll({ filters: { isActive: true } });
      const userIds = users.map(u => u.id);

      return this.sendSystemNotification(userIds, title, message, type, priority, options);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  // Private helper methods
  private isTransactionFlagged(transaction: TransactionModel): boolean {
    const metadata = transaction.metadata;
    return metadata.flags && metadata.flags.length > 0 && 
           metadata.flags.some((flag: any) => !flag.resolved);
  }

  private isUserSuspicious(user: UserModel): boolean {
    const metadata = user.metadata;
    return metadata.suspiciousActivity || false;
  }

  private getUserFlags(user: UserModel, transactions: TransactionModel[]): string[] {
    const flags: string[] = [];

    // Check for high transaction volume
    const recentTransactions = transactions.filter(t => 
      t.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (recentTransactions.length > 20) {
      flags.push('high_transaction_volume');
    }

    // Check for large amounts
    const largeTransactions = transactions.filter(t => t.amount > 10000);
    if (largeTransactions.length > 0) {
      flags.push('large_transaction_amounts');
    }

    // Check account age
    const accountAge = Date.now() - user.createdAt.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (accountAge < oneWeek && transactions.length > 5) {
      flags.push('new_account_high_activity');
    }

    return flags;
  }

  private getTransactionFlags(transaction: TransactionModel): string[] {
    const flags: string[] = [];

    if (transaction.amount > 10000) {
      flags.push('large_amount');
    }

    if (transaction.type === 'external') {
      flags.push('external_transaction');
    }

    const metadata = transaction.metadata;
    if (metadata.flags && metadata.flags.length > 0) {
      flags.push('manually_flagged');
    }

    return flags;
  }

  private calculateTransactionRiskScore(transaction: TransactionModel): number {
    let score = 0;

    // Amount-based risk
    if (transaction.amount > 10000) score += 30;
    else if (transaction.amount > 5000) score += 20;
    else if (transaction.amount > 1000) score += 10;

    // Type-based risk
    if (transaction.type === 'external') score += 15;
    if (transaction.type === 'withdrawal') score += 10;

    // Time-based risk (late night transactions)
    const hour = transaction.createdAt.getHours();
    if (hour < 6 || hour > 22) score += 5;

    // Status-based risk
    if (transaction.isFailed()) score += 20;

    return Math.min(score, 100); // Cap at 100
  }

  private async logAuditEntry(entry: Omit<AuditLogEntry, 'id'>): Promise<void> {
    // In production, this would save to a dedicated audit log database
    console.log('Audit Log Entry:', entry);
  }

  // Export and reporting
  async exportUserData(
    filters: UserManagementFilters = {},
    format: 'csv' | 'json' = 'csv',
    options: ControllerOptions = {}
  ): Promise<ControllerResponse> {
    try {
      const usersResult = await this.getUsers(filters, { limit: 10000 }, { cache: false });
      
      if (!usersResult.success) {
        return usersResult;
      }

      const users = usersResult.data as UserModel[];
      
      let exportData: any;
      if (format === 'csv') {
        exportData = this.formatUsersForCSV(users);
      } else {
        exportData = users.map(u => u.exportData());
      }

      return this.createSuccessResponse(exportData, {
        format,
        count: users.length,
        exportedAt: new Date()
      });
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  private formatUsersForCSV(users: UserModel[]): string {
    const headers = [
      'ID', 'Email', 'First Name', 'Last Name', 'Is Admin', 'Is Active',
      'Created At', 'Last Login', 'Total Transactions'
    ];

    const rows = users.map(u => [
      u.id,
      u.email || '',
      u.firstName || '',
      u.lastName || '',
      u.isAdmin ? 'Yes' : 'No',
      u.isActive ? 'Yes' : 'No',
      u.createdAt.toISOString(),
      u.lastLoginAt?.toISOString() || '',
      u.metadata.totalTransactions || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}