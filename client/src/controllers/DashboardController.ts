import { BaseController, ControllerOptions } from './BaseController';
import { UserModel } from '../models/UserModel';
import { TransactionModel } from '../models/TransactionModel';
import { PaymentMethodModel } from '../models/PaymentMethodModel';
import { NotificationModel } from '../models/NotificationModel';
import { apiRequest } from '../lib/queryClient';

export interface DashboardData {
  user: UserModel;
  balance: {
    available: number;
    pending: number;
    total: number;
  };
  recentTransactions: TransactionModel[];
  paymentMethods: PaymentMethodModel[];
  notifications: NotificationModel[];
  pendingRequests: any[];
  quickStats: {
    totalTransactions: number;
    monthlySpending: number;
    pendingAmount: number;
    activePaymentMethods: number;
  };
}

export interface DashboardWidgetData {
  balanceWidget: any;
  transactionWidget: any;
  paymentMethodWidget: any;
  activityWidget: any;
}

export interface AdminDashboardData extends DashboardData {
  systemStats: {
    totalUsers: number;
    totalTransactions: number;
    totalVolume: number;
    activeUsers: number;
    pendingIssues: number;
    systemHealth: string;
  };
  recentActivity: any[];
  alerts: any[];
  serverMetrics: any;
}

export class DashboardController extends BaseController {
  private static instance: DashboardController;

  constructor(options?: ControllerOptions) {
    super(options);
  }

  static getInstance(options?: ControllerOptions): DashboardController {
    if (!DashboardController.instance) {
      DashboardController.instance = new DashboardController(options);
    }
    return DashboardController.instance;
  }

  /**
   * Get complete dashboard data for user
   */
  async getDashboardData(
    userId: string,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; data?: DashboardData | AdminDashboardData; error?: string }> {
    try {
      const cacheKey = `dashboard_data_${userId}_${isAdmin}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      // Get user data
      const userResult = await this.findById(UserModel, userId);
      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'User not found' };
      }

      const user = userResult.data as UserModel;

      // Parallel fetch of all dashboard components
      const [
        balanceData,
        recentTransactions,
        paymentMethods,
        notifications,
        pendingRequests,
        quickStats
      ] = await Promise.allSettled([
        this.getWalletBalance(userId),
        this.getRecentTransactions(userId),
        this.getPaymentMethods(userId),
        this.getRecentNotifications(userId),
        this.getPendingRequests(userId),
        this.getQuickStats(userId)
      ]);

      const dashboardData: DashboardData = {
        user,
        balance: this.extractData(balanceData) || { available: 0, pending: 0, total: 0 },
        recentTransactions: this.extractData(recentTransactions) || [],
        paymentMethods: this.extractData(paymentMethods) || [],
        notifications: this.extractData(notifications) || [],
        pendingRequests: this.extractData(pendingRequests) || [],
        quickStats: this.extractData(quickStats) || {
          totalTransactions: 0,
          monthlySpending: 0,
          pendingAmount: 0,
          activePaymentMethods: 0
        }
      };

      // If admin, get additional admin data
      if (isAdmin) {
        const [systemStats, recentActivity, alerts, serverMetrics] = await Promise.allSettled([
          this.getSystemStats(),
          this.getRecentActivity(),
          this.getSystemAlerts(),
          this.getServerMetrics()
        ]);

        const adminDashboardData: AdminDashboardData = {
          ...dashboardData,
          systemStats: this.extractData(systemStats) || {
            totalUsers: 0,
            totalTransactions: 0,
            totalVolume: 0,
            activeUsers: 0,
            pendingIssues: 0,
            systemHealth: 'unknown'
          },
          recentActivity: this.extractData(recentActivity) || [],
          alerts: this.extractData(alerts) || [],
          serverMetrics: this.extractData(serverMetrics) || {}
        };

        this.setCache(cacheKey, adminDashboardData, 120); // Cache for 2 minutes
        return { success: true, data: adminDashboardData };
      }

      this.setCache(cacheKey, dashboardData, 180); // Cache for 3 minutes
      return { success: true, data: dashboardData };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to load dashboard data: ' + (error as Error).message
      };
    }
  }

  /**
   * Get wallet balance for user
   */
  async getWalletBalance(userId: string): Promise<any> {
    try {
      const cacheKey = `wallet_balance_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest(`/api/users/${userId}/balance`, 'GET');
      
      if (result) {
        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return result;
      }

      return { available: 0, pending: 0, total: 0 };

    } catch (error) {
      return { available: 0, pending: 0, total: 0 };
    }
  }

  /**
   * Get recent transactions for dashboard
   */
  async getRecentTransactions(userId: string, limit: number = 5): Promise<TransactionModel[]> {
    try {
      const cacheKey = `recent_transactions_${userId}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/transactions', 'GET', {
        userId,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (result) {
        const transactions = result.map((t: any) => new TransactionModel(t));
        this.setCache(cacheKey, transactions, 180); // Cache for 3 minutes
        return transactions;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get payment methods for dashboard
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethodModel[]> {
    try {
      const cacheKey = `payment_methods_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/payments', 'GET', { userId });

      if (result) {
        const paymentMethods = result.map((pm: any) => new PaymentMethodModel(pm));
        this.setCache(cacheKey, paymentMethods, 600); // Cache for 10 minutes
        return paymentMethods;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(userId: string, limit: number = 5): Promise<NotificationModel[]> {
    try {
      const cacheKey = `recent_notifications_${userId}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/notifications', 'GET', {
        userId,
        limit,
        unreadFirst: true
      });

      if (result) {
        const notifications = result.map((n: any) => new NotificationModel(n));
        this.setCache(cacheKey, notifications, 180); // Cache for 3 minutes
        return notifications;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get pending money requests
   */
  async getPendingRequests(userId: string): Promise<any[]> {
    try {
      const cacheKey = `pending_requests_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/pending-requests', 'GET', { userId });

      if (result) {
        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return result;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get quick statistics for dashboard
   */
  async getQuickStats(userId: string): Promise<any> {
    try {
      const cacheKey = `quick_stats_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get current month stats
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      const [allTransactions, monthlyTransactions, paymentMethods] = await Promise.all([
        apiRequest('/api/transactions', 'GET', { userId, status: ['completed', 'pending'] }),
        apiRequest('/api/transactions', 'GET', {
          userId,
          fromDate: startOfMonth.toISOString(),
          status: ['completed', 'pending']
        }),
        apiRequest('/api/payments', 'GET', { userId })
      ]);

      const totalTransactions = allTransactions?.length || 0;
      const monthlySpending = monthlyTransactions?.reduce((sum: number, t: any) => {
        return t.fromUserId === userId ? sum + (t.amount || 0) : sum;
      }, 0) || 0;

      const pendingAmount = allTransactions?.reduce((sum: number, t: any) => {
        return t.status === 'pending' ? sum + (t.amount || 0) : sum;
      }, 0) || 0;

      const activePaymentMethods = paymentMethods?.filter((pm: any) => pm.isActive).length || 0;

      const stats = {
        totalTransactions,
        monthlySpending,
        pendingAmount,
        activePaymentMethods
      };

      this.setCache(cacheKey, stats, 600); // Cache for 10 minutes
      return stats;

    } catch (error) {
      return {
        totalTransactions: 0,
        monthlySpending: 0,
        pendingAmount: 0,
        activePaymentMethods: 0
      };
    }
  }

  /**
   * Get system statistics (admin only)
   */
  async getSystemStats(): Promise<any> {
    try {
      const cacheKey = 'system_stats';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/admin/stats', 'GET');

      if (result) {
        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return result;
      }

      return {
        totalUsers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        activeUsers: 0,
        pendingIssues: 0,
        systemHealth: 'unknown'
      };

    } catch (error) {
      return {
        totalUsers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        activeUsers: 0,
        pendingIssues: 0,
        systemHealth: 'error'
      };
    }
  }

  /**
   * Get recent system activity (admin only)
   */
  async getRecentActivity(): Promise<any[]> {
    try {
      const cacheKey = 'recent_activity';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/admin/activity', 'GET', { limit: 20 });

      if (result) {
        this.setCache(cacheKey, result, 180); // Cache for 3 minutes
        return result;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get system alerts (admin only)
   */
  async getSystemAlerts(): Promise<any[]> {
    try {
      const cacheKey = 'system_alerts';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/admin/alerts', 'GET');

      if (result) {
        this.setCache(cacheKey, result, 120); // Cache for 2 minutes
        return result;
      }

      return [];

    } catch (error) {
      return [];
    }
  }

  /**
   * Get server metrics (admin only)
   */
  async getServerMetrics(): Promise<any> {
    try {
      const cacheKey = 'server_metrics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest('/api/admin/metrics', 'GET');

      if (result) {
        this.setCache(cacheKey, result, 60); // Cache for 1 minute
        return result;
      }

      return {};

    } catch (error) {
      return {};
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(userId: string, isAdmin: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear all dashboard-related caches
      this.clearCache(`dashboard_data_${userId}_${isAdmin}`);
      this.clearCache(`wallet_balance_${userId}`);
      this.clearCache(`recent_transactions_${userId}_5`);
      this.clearCache(`payment_methods_${userId}`);
      this.clearCache(`recent_notifications_${userId}_5`);
      this.clearCache(`pending_requests_${userId}`);
      this.clearCache(`quick_stats_${userId}`);

      if (isAdmin) {
        this.clearCache('system_stats');
        this.clearCache('recent_activity');
        this.clearCache('system_alerts');
        this.clearCache('server_metrics');
      }

      // Reload dashboard data
      const result = await this.getDashboardData(userId, isAdmin);
      return { success: result.success, error: result.error };

    } catch (error) {
      return {
        success: false,
        error: 'Dashboard refresh failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get dashboard widgets configuration
   */
  getDashboardWidgets(isAdmin: boolean = false): any[] {
    const userWidgets = [
      {
        id: 'balance',
        title: 'Wallet Balance',
        component: 'BalanceWidget',
        size: 'large',
        order: 1
      },
      {
        id: 'recent_transactions',
        title: 'Recent Transactions',
        component: 'TransactionsWidget',
        size: 'medium',
        order: 2
      },
      {
        id: 'payment_methods',
        title: 'Payment Methods',
        component: 'PaymentMethodsWidget',
        size: 'medium',
        order: 3
      },
      {
        id: 'notifications',
        title: 'Recent Notifications',
        component: 'NotificationsWidget',
        size: 'small',
        order: 4
      }
    ];

    const adminWidgets = [
      ...userWidgets,
      {
        id: 'system_stats',
        title: 'System Overview',
        component: 'SystemStatsWidget',
        size: 'large',
        order: 0
      },
      {
        id: 'recent_activity',
        title: 'Recent Activity',
        component: 'ActivityWidget',
        size: 'medium',
        order: 5
      },
      {
        id: 'alerts',
        title: 'System Alerts',
        component: 'AlertsWidget',
        size: 'small',
        order: 6
      }
    ];

    return isAdmin ? adminWidgets : userWidgets;
  }

  /**
   * Update dashboard widget configuration
   */
  async updateWidgetConfig(
    userId: string,
    widgetId: string,
    config: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await apiRequest('/api/dashboard/widgets', 'PUT', {
        userId,
        widgetId,
        config
      });

      if (result) {
        // Clear dashboard cache to reload with new config
        this.clearCache(`dashboard_data_${userId}_true`);
        this.clearCache(`dashboard_data_${userId}_false`);
        return { success: true };
      }

      return { success: false, error: 'Failed to update widget configuration' };

    } catch (error) {
      return {
        success: false,
        error: 'Widget update failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Extract data from Promise.allSettled results
   */
  private extractData(result: PromiseSettledResult<any>): any {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return null;
  }

  /**
   * Get model class for BaseController
   */
  protected getModelClass() {
    return UserModel;
  }
}