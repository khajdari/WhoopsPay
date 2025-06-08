import { BaseController, ControllerOptions } from './BaseController';
import { apiRequest } from '../lib/queryClient';

export interface IssueReportData {
  title: string;
  description: string;
  category: string;
  priority: string;
  attachments?: File[];
}

export interface IssueReport {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: any[];
}

export interface IssueFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface IssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionTime: number;
}

export class IssueReportController extends BaseController {
  private static instance: IssueReportController;
  
  private readonly ISSUE_CATEGORIES = [
    'payment_issue',
    'transaction_problem', 
    'account_access',
    'security_concern',
    'feature_request',
    'bug_report',
    'other'
  ];

  private readonly ISSUE_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
  private readonly ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

  constructor(options?: ControllerOptions) {
    super(options);
  }

  static getInstance(options?: ControllerOptions): IssueReportController {
    if (!IssueReportController.instance) {
      IssueReportController.instance = new IssueReportController(options);
    }
    return IssueReportController.instance;
  }

  /**
   * Create new issue report
   */
  async createIssueReport(
    issueData: IssueReportData,
    userId: string
  ): Promise<{ success: boolean; data?: IssueReport; error?: string }> {
    try {
      // Validate issue data
      const validation = this.validateIssueData(issueData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Prepare issue report data
      const reportData = {
        userId,
        title: issueData.title.trim(),
        description: issueData.description.trim(),
        category: issueData.category,
        priority: issueData.priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          reportId: `ISS${Date.now()}${Math.random().toString(36).substr(2, 5)}`
        }
      };

      // Submit issue report
      const result = await apiRequest('/api/issues', 'POST', reportData);
      
      if (result) {
        // Clear relevant caches
        this.clearCache(`user_issues_${userId}`);
        this.clearCache('all_issues');
        this.clearCache('issue_stats');

        // Log issue creation
        await this.logActivity(userId, 'issue_created', {
          issueId: result.id,
          category: issueData.category,
          priority: issueData.priority
        });

        // Handle file attachments if any
        if (issueData.attachments && issueData.attachments.length > 0) {
          await this.uploadAttachments(result.id, issueData.attachments);
        }

        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to create issue report' };

    } catch (error) {
      return {
        success: false,
        error: 'Issue creation failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get user's issue reports
   */
  async getUserIssues(
    userId: string,
    filters: IssueFilters = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<{ success: boolean; data?: IssueReport[]; pagination?: any; error?: string }> {
    try {
      const cacheKey = `user_issues_${userId}_${JSON.stringify({ filters, options })}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached.data, pagination: cached.pagination };
      }

      const params = this.buildIssueQueryParams(filters, options, userId);
      const response = await apiRequest('/api/issues', 'GET', params);
      
      if (response) {
        const result = {
          data: response.data || response,
          pagination: response.pagination
        };

        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return { success: true, ...result };
      }

      return { success: false, error: 'Failed to fetch user issues' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user issues: ' + (error as Error).message
      };
    }
  }

  /**
   * Get all issue reports (admin only)
   */
  async getAllIssues(
    filters: IssueFilters = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<{ success: boolean; data?: IssueReport[]; pagination?: any; error?: string }> {
    try {
      const cacheKey = `all_issues_${JSON.stringify({ filters, options })}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached.data, pagination: cached.pagination };
      }

      const params = this.buildIssueQueryParams(filters, options);
      const response = await apiRequest('/api/admin/issues', 'GET', params);
      
      if (response) {
        const result = {
          data: response.data || response,
          pagination: response.pagination
        };

        this.setCache(cacheKey, result, 180); // Cache for 3 minutes
        return { success: true, ...result };
      }

      return { success: false, error: 'Failed to fetch all issues' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get all issues: ' + (error as Error).message
      };
    }
  }

  /**
   * Get issue by ID
   */
  async getIssueById(
    issueId: number,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; data?: IssueReport; error?: string }> {
    try {
      const cacheKey = `issue_${issueId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const endpoint = isAdmin ? `/api/admin/issues/${issueId}` : `/api/issues/${issueId}`;
      const result = await apiRequest(endpoint, 'GET');
      
      if (result) {
        this.setCache(cacheKey, result, 300);
        return { success: true, data: result };
      }

      return { success: false, error: 'Issue not found' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get issue: ' + (error as Error).message
      };
    }
  }

  /**
   * Update issue status (admin only)
   */
  async updateIssueStatus(
    issueId: number,
    status: string,
    adminNotes?: string,
    adminUserId?: string
  ): Promise<{ success: boolean; data?: IssueReport; error?: string }> {
    try {
      if (!this.ISSUE_STATUSES.includes(status)) {
        return { success: false, error: 'Invalid issue status' };
      }

      const updateData: any = { status };
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      const result = await apiRequest(`/api/admin/issues/${issueId}/status`, 'PUT', updateData);
      
      if (result) {
        // Clear relevant caches
        this.clearCache(`issue_${issueId}`);
        this.clearCache('all_issues');
        this.clearCache('issue_stats');

        // Log admin action
        if (adminUserId) {
          await this.logActivity(adminUserId, 'issue_status_updated', {
            issueId,
            oldStatus: result.previousStatus,
            newStatus: status,
            adminNotes
          });
        }

        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to update issue status' };

    } catch (error) {
      return {
        success: false,
        error: 'Issue status update failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Assign issue to admin (admin only)
   */
  async assignIssue(
    issueId: number,
    assignedTo: string,
    adminUserId?: string
  ): Promise<{ success: boolean; data?: IssueReport; error?: string }> {
    try {
      const result = await apiRequest(`/api/admin/issues/${issueId}/assign`, 'PUT', {
        assignedTo
      });
      
      if (result) {
        // Clear relevant caches
        this.clearCache(`issue_${issueId}`);
        this.clearCache('all_issues');

        // Log admin action
        if (adminUserId) {
          await this.logActivity(adminUserId, 'issue_assigned', {
            issueId,
            assignedTo,
            previousAssignee: result.previousAssignedTo
          });
        }

        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to assign issue' };

    } catch (error) {
      return {
        success: false,
        error: 'Issue assignment failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Add comment to issue
   */
  async addIssueComment(
    issueId: number,
    comment: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!comment.trim()) {
        return { success: false, error: 'Comment cannot be empty' };
      }

      const commentData = {
        issueId,
        comment: comment.trim(),
        userId,
        isAdmin,
        createdAt: new Date().toISOString()
      };

      const result = await apiRequest(`/api/issues/${issueId}/comments`, 'POST', commentData);
      
      if (result) {
        // Clear issue cache
        this.clearCache(`issue_${issueId}`);

        // Log comment activity
        await this.logActivity(userId, 'issue_comment_added', {
          issueId,
          commentLength: comment.length,
          isAdmin
        });

        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to add comment' };

    } catch (error) {
      return {
        success: false,
        error: 'Comment addition failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get issue statistics (admin only)
   */
  async getIssueStats(
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: IssueStats; error?: string }> {
    try {
      const cacheKey = `issue_stats_${dateRange ? `${dateRange.start.getTime()}_${dateRange.end.getTime()}` : 'all'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange.start.toISOString();
        params.endDate = dateRange.end.toISOString();
      }

      const result = await apiRequest('/api/admin/issues/stats', 'GET', params);
      
      if (result) {
        this.setCache(cacheKey, result, 600); // Cache for 10 minutes
        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to fetch issue statistics' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get issue stats: ' + (error as Error).message
      };
    }
  }

  /**
   * Search issues
   */
  async searchIssues(
    query: string,
    filters: IssueFilters = {},
    isAdmin: boolean = false,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ success: boolean; data?: IssueReport[]; pagination?: any; error?: string }> {
    try {
      if (!query || query.length < 3) {
        return { success: false, error: 'Search query must be at least 3 characters' };
      }

      const params = {
        ...this.buildIssueQueryParams(filters, options),
        search: query
      };

      const endpoint = isAdmin ? '/api/admin/issues/search' : '/api/issues/search';
      const response = await apiRequest(endpoint, 'GET', params);
      
      if (response) {
        return {
          success: true,
          data: response.data || response,
          pagination: response.pagination
        };
      }

      return { success: false, error: 'No issues found' };

    } catch (error) {
      return {
        success: false,
        error: 'Issue search failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Export issues to CSV (admin only)
   */
  async exportIssues(
    filters: IssueFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<{ success: boolean; data?: Blob; filename?: string; error?: string }> {
    try {
      const params = {
        ...this.buildIssueQueryParams(filters, { limit: 10000 }),
        format
      };

      const response = await fetch('/api/admin/issues/export?' + new URLSearchParams(params));
      
      if (response.ok) {
        const blob = await response.blob();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `issues_export_${timestamp}.${format}`;
        
        return { success: true, data: blob, filename };
      }

      return { success: false, error: 'Export failed' };

    } catch (error) {
      return {
        success: false,
        error: 'Export failed: ' + (error as Error).message
      };
    }
  }

  /**
   * Get issues requiring attention (admin dashboard)
   */
  async getIssuesRequiringAttention(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const cacheKey = 'issues_requiring_attention';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await apiRequest('/api/admin/issues/attention', 'GET');
      
      if (result) {
        this.setCache(cacheKey, result, 300); // Cache for 5 minutes
        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to fetch issues requiring attention' };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get issues requiring attention: ' + (error as Error).message
      };
    }
  }

  /**
   * Validate issue report data
   */
  private validateIssueData(issueData: IssueReportData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!issueData.title || issueData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (!issueData.description || issueData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!issueData.category || !this.ISSUE_CATEGORIES.includes(issueData.category)) {
      errors.push('Valid category is required');
    }

    if (!issueData.priority || !this.ISSUE_PRIORITIES.includes(issueData.priority)) {
      errors.push('Valid priority is required');
    }

    if (issueData.title && issueData.title.length > 100) {
      errors.push('Title cannot exceed 100 characters');
    }

    if (issueData.description && issueData.description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Build query parameters for issue requests
   */
  private buildIssueQueryParams(
    filters: IssueFilters,
    options: { page?: number; limit?: number } = {},
    userId?: string
  ): any {
    const params: any = {
      page: options.page || 1,
      limit: options.limit || 20
    };

    if (userId) {
      params.userId = userId;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.priority) {
      params.priority = filters.priority;
    }

    if (filters.assignedTo) {
      params.assignedTo = filters.assignedTo;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start.toISOString();
      params.endDate = filters.dateRange.end.toISOString();
    }

    return params;
  }

  /**
   * Upload attachments for issue
   */
  private async uploadAttachments(issueId: number, files: File[]): Promise<void> {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('issueId', issueId.toString());

        await fetch('/api/issues/attachments', {
          method: 'POST',
          body: formData
        });
      }
    } catch (error) {
      console.warn('Failed to upload attachments:', error);
    }
  }

  /**
   * Log issue-related activity
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
          module: 'issues'
        }
      });
    } catch (error) {
      // Don't fail the main operation if logging fails
      console.warn('Failed to log issue activity:', error);
    }
  }

  /**
   * Get available categories
   */
  getAvailableCategories(): string[] {
    return [...this.ISSUE_CATEGORIES];
  }

  /**
   * Get available priorities
   */
  getAvailablePriorities(): string[] {
    return [...this.ISSUE_PRIORITIES];
  }

  /**
   * Get available statuses
   */
  getAvailableStatuses(): string[] {
    return [...this.ISSUE_STATUSES];
  }

  /**
   * Format category for display
   */
  formatCategory(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get priority color for UI
   */
  getPriorityColor(priority: string): string {
    const colors = {
      low: 'text-green-400 border-green-400',
      medium: 'text-yellow-400 border-yellow-400',
      high: 'text-orange-400 border-orange-400',
      urgent: 'text-red-400 border-red-400'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-400 border-gray-400';
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors = {
      open: 'text-blue-400 border-blue-400',
      in_progress: 'text-yellow-400 border-yellow-400',
      resolved: 'text-green-400 border-green-400',
      closed: 'text-gray-400 border-gray-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400 border-gray-400';
  }
}