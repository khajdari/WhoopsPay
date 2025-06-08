import { apiRequest } from "@/lib/queryClient";

export interface SystemHealth {
  startTime: string;
  logs: {
    express: string[];
    db: string[];
  };
}

export interface IssueReport {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: number;
  updatedAt?: number;
  assignedTo?: string;
  adminNotes?: string;
}

export interface CreateIssueReport {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export interface UpdateIssueStatus {
  status: string;
  adminNotes?: string;
}

export class AdminService {
  static async getSystemHealth(): Promise<SystemHealth> {
    return apiRequest("/api/admin/health", "GET");
  }

  static async getAllUsers(): Promise<any[]> {
    return apiRequest("/api/admin/users", "GET");
  }

  static async getAllTransactions(): Promise<any[]> {
    return apiRequest("/api/admin/transactions", "GET");
  }

  static async deleteUser(userId: string): Promise<void> {
    return apiRequest(`/api/admin/users/${userId}`, "DELETE");
  }

  static async getAllIssueReports(): Promise<IssueReport[]> {
    return apiRequest("/api/admin/issues", "GET");
  }

  static async updateIssueStatus(id: number, update: UpdateIssueStatus): Promise<IssueReport> {
    return apiRequest(`/api/admin/issues/${id}/status`, "PUT", update);
  }

  static async assignIssue(id: number, assignedTo: string): Promise<IssueReport> {
    return apiRequest(`/api/admin/issues/${id}/assign`, "PUT", { assignedTo });
  }

  static async createIssueReport(report: CreateIssueReport): Promise<IssueReport> {
    return apiRequest("/api/issues", "POST", report);
  }

  static async getUserIssueReports(): Promise<IssueReport[]> {
    return apiRequest("/api/issues", "GET");
  }

  static formatPriority(priority: string): string {
    switch (priority) {
      case 'low': return '🟢 Low';
      case 'medium': return '🟡 Medium';
      case 'high': return '🟠 High';
      case 'critical': return '🔴 Critical';
      default: return priority;
    }
  }

  static formatStatus(status: string): string {
    switch (status) {
      case 'open': return '🔵 Open';
      case 'in_progress': return '🟡 In Progress';
      case 'resolved': return '🟢 Resolved';
      case 'closed': return '⚫ Closed';
      default: return status;
    }
  }

  static formatCategory(category: string): string {
    switch (category) {
      case 'security': return '🔒 Security';
      case 'payment': return '💳 Payment';
      case 'ui': return '🎨 User Interface';
      case 'performance': return '⚡ Performance';
      case 'bug': return '🐛 Bug';
      case 'feature': return '✨ Feature Request';
      default: return category;
    }
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'text-blue-400';
      case 'in_progress': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  }

  static getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }
}