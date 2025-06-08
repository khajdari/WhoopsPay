import { BaseController, ControllerOptions } from './BaseController';
import { UserModel } from '../models/UserModel';
import { TransactionModel } from '../models/TransactionModel';
import { NotificationModel } from '../models/NotificationModel';
import { apiRequest } from '../lib/queryClient';

export interface ProfileData {
  user: UserModel;
  activityHistory: any[];
  securitySettings: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginSessions: any[];
    trustedDevices: any[];
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: string;
      transactionVisibility: string;
    };
  };
  statistics: {
    accountAge: number;
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
    averageTransaction: number;
  };
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: any;
}

export interface SecurityUpdateData {
  currentPassword: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
  trustedDevice?: boolean;
}

export interface ActivityLogEntry {
  id: number;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class ProfileController extends BaseController {
  private static instance: ProfileController;

  constructor(options?: ControllerOptions) {
    super(options);
  }

  static getInstance(options?: ControllerOptions): ProfileController {
    if (!ProfileController.instance) {
      ProfileController.instance = new ProfileController(options);
    }
    return ProfileController.instance;
  }

  /**
   * Get complete profile data for user
   */
  async getProfileData(userId: string): Promise<{ success: boolean; data?: ProfileData; error?: string }> {
    try {
      const cacheKey = `profile_data_${userId}`;
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

      // Parallel fetch of profile components
      const [
        activityHistory,
        securitySettings,
        preferences,
        statistics
      ] = await Promise.allSettled([
        this.getActivityHistory(userId),
        this.getSecuritySettings(userId),
        this.getUserPreferences(userId),
        this.getProfileStatistics(userId)
      ]);

      const profileData: ProfileData = {
        user,
        activityHistory: this.extractData(activityHistory) || [],
        securitySettings: this.extractData(securitySettings) || {
          twoFactorEnabled: false,
          lastPasswordChange: '',
          loginSessions: [],
          trustedDevices: []
        },
        preferences: this.extractData(preferences) || {
          language: 'en',
          currency: 'USD',
          notifications: { email: true, sms: false, push: true },
          privacy: { profileVisibility: 'private', transactionVisibility: 'private' }
        },
        statistics: this.extractData(statistics) || {
          accountAge: 0,
          totalTransactions: 0,
          totalSpent: 0,
          totalReceived: 0,
          averageTransaction: 0
        }
      };

      this.setCache(cacheKey, profileData, 300); // Cache for 5 minutes
      return { success: true, data: profileData };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to load profile data: ' + (error as Error).message
      };
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(
    userId: string,
    updateData: ProfileUpdateData
  ): Promise<{ success: boolean; data?: UserModel; error?: string }> {
    try {
      // Validate update data
      const validation = this.validateProfileUpdate(updateData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Prepare update payload
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const result = await apiRequest(`/api/users/${userId}/profile`, 'PUT', updatePayload);

      if (result) {
        const updatedUser = new UserModel(result);

        // Clear relevant caches
        this.clearCache(`profile_data_${userId}`);
        this.clearCache(`user_${userId}`);

        // Log profile update activity
        await this.logActivity(userId, 'profile_updated', {
          fields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        });

        return { success: true, data: updatedUser };
      }

      return { success: false, error: 'Failed to update profile' };

    } catch (error) {
      return {
        success: false,
        error: 'Profile update failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    userId: string,
    securityData: SecurityUpdateData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate current password
      const passwordValidation = await this.validateCurrentPassword(userId, securityData.currentPassword);
      if (!passwordValidation.success) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const updatePayload: any = {};

      // Handle password change
      if (securityData.newPassword) {
        const passwordValidation = this.validateNewPassword(securityData.newPassword);
        if (!passwordValidation.isValid) {
          return { success: false, error: passwordValidation.errors.join(', ') };
        }
        updatePayload.newPassword = securityData.newPassword;
      }

      // Handle 2FA toggle
      if (securityData.twoFactorEnabled !== undefined) {
        updatePayload.twoFactorEnabled = securityData.twoFactorEnabled;
      }

      // Handle trusted device
      if (securityData.trustedDevice !== undefined) {
        updatePayload.trustedDevice = securityData.trustedDevice;
      }

      const result = await apiRequest(`/api/users/${userId}/security`, 'PUT', updatePayload);

      if (result) {
        // Clear security-related caches
        this.clearCache(`profile_data_${userId}`);
        this.clearCache(`security_settings_${userId}`);

        // Log security changes
        await this.logActivity(userId, 'security_settings_updated', {
          changes: Object.keys(updatePayload),
          timestamp: new Date().toISOString(),
          riskLevel: 'medium'
        });

        return { success: true };
      }

      return { success: false, error: 'Failed to update security settings' };

    } catch (error) {
      return {
        success: false,
        error: 'Security update failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await apiRequest(`/api/users/${userId}/preferences`, 'PUT', preferences);

      if (result) {
        // Clear preference-related caches
        this.clearCache(`profile_data_${userId}`);
        this.clearCache(`user_preferences_${userId}`);

        // Log preference changes
        await this.logActivity(userId, 'preferences_updated', {
          preferences: Object.keys(preferences),
          timestamp: new Date().toISOString()
        });

        return { success: true };
      }

      return { success: false, error: 'Failed to update preferences' };

    } catch (error) {
      return {
        success: false,
        error: 'Preferences update failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get user activity history
   */
  async getActivityHistory(
    userId: string,
    options: { page?: number; limit?: number; filter?: string } = {}
  ): Promise<ActivityLogEntry[]> {
    try {
      const cacheKey = `activity_history_${userId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const params = {
        userId,
        page: options.page || 1,
        limit: options.limit || 50,
        filter: options.filter
      };

      const result = await apiRequest('/api/activity-log', 'GET', params);

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
   * Get security settings
   */
  async getSecuritySettings(userId: string): Promise<any> {
    try {
      const cacheKey = `security_settings_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest(`/api/users/${userId}/security`, 'GET');

      if (result) {
        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return result;
      }

      return {
        twoFactorEnabled: false,
        lastPasswordChange: '',
        loginSessions: [],
        trustedDevices: []
      };

    } catch (error) {
      return {
        twoFactorEnabled: false,
        lastPasswordChange: '',
        loginSessions: [],
        trustedDevices: []
      };
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const cacheKey = `user_preferences_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest(`/api/users/${userId}/preferences`, 'GET');

      if (result) {
        this.setCache(cacheKey, result, 600); // Cache for 10 minutes
        return result;
      }

      return {
        language: 'en',
        currency: 'USD',
        notifications: { email: true, sms: false, push: true },
        privacy: { profileVisibility: 'private', transactionVisibility: 'private' }
      };

    } catch (error) {
      return {
        language: 'en',
        currency: 'USD',
        notifications: { email: true, sms: false, push: true },
        privacy: { profileVisibility: 'private', transactionVisibility: 'private' }
      };
    }
  }

  /**
   * Get profile statistics
   */
  async getProfileStatistics(userId: string): Promise<any> {
    try {
      const cacheKey = `profile_statistics_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiRequest(`/api/users/${userId}/statistics`, 'GET');

      if (result) {
        this.setCache(cacheKey, result, 600); // Cache for 10 minutes
        return result;
      }

      return {
        accountAge: 0,
        totalTransactions: 0,
        totalSpent: 0,
        totalReceived: 0,
        averageTransaction: 0
      };

    } catch (error) {
      return {
        accountAge: 0,
        totalTransactions: 0,
        totalSpent: 0,
        totalReceived: 0,
        averageTransaction: 0
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(
    userId: string,
    password: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password
      const passwordValidation = await this.validateCurrentPassword(userId, password);
      if (!passwordValidation.success) {
        return { success: false, error: 'Password verification failed' };
      }

      const result = await apiRequest(`/api/users/${userId}`, 'DELETE', {
        password,
        reason: reason || 'User requested account deletion'
      });

      if (result) {
        // Clear all user-related caches
        this.clearUserCaches(userId);

        // Log account deletion
        await this.logActivity(userId, 'account_deleted', {
          reason,
          timestamp: new Date().toISOString(),
          riskLevel: 'high'
        });

        return { success: true };
      }

      return { success: false, error: 'Failed to delete account' };

    } catch (error) {
      return {
        success: false,
        error: 'Account deletion failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Export user data
   */
  async exportUserData(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<{ success: boolean; data?: Blob; filename?: string; error?: string }> {
    try {
      const response = await fetch(`/api/users/${userId}/export?format=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `user_data_export_${timestamp}.${format}`;

        // Log data export
        await this.logActivity(userId, 'data_exported', {
          format,
          timestamp: new Date().toISOString()
        });

        return { success: true, data: blob, filename };
      }

      return { success: false, error: 'Export failed' };

    } catch (error) {
      return {
        success: false,
        error: 'Data export failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Validate profile update data
   */
  private validateProfileUpdate(updateData: ProfileUpdateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (updateData.email) {
      if (!/\S+@\S+\.\S+/.test(updateData.email)) {
        errors.push('Invalid email format');
      }
    }

    if (updateData.firstName && updateData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (updateData.lastName && updateData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (updateData.phone) {
      if (!/^\+?[\d\s\-\(\)]{10,}$/.test(updateData.phone)) {
        errors.push('Invalid phone number format');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate new password
   */
  private validateNewPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate current password
   */
  private async validateCurrentPassword(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await apiRequest('/api/auth/validate-password', 'POST', {
        userId,
        password
      });

      return { success: result?.valid || false };

    } catch (error) {
      return { success: false, error: 'Password validation failed' };
    }
  }

  /**
   * Clear all user-related caches
   */
  private clearUserCaches(userId: string): void {
    const cacheKeys = [
      `profile_data_${userId}`,
      `user_${userId}`,
      `activity_history_${userId}`,
      `security_settings_${userId}`,
      `user_preferences_${userId}`,
      `profile_statistics_${userId}`,
      `dashboard_data_${userId}_true`,
      `dashboard_data_${userId}_false`
    ];

    cacheKeys.forEach(key => this.clearCache(key));
  }

  /**
   * Log user activity
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
          module: 'profile',
          ipAddress: this.getClientIP(),
          userAgent: navigator.userAgent
        }
      });
    } catch (error) {
      console.warn('Failed to log profile activity:', error);
    }
  }

  /**
   * Get client IP address (placeholder)
   */
  private getClientIP(): string {
    // In a real application, this would be handled by the server
    return 'unknown';
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