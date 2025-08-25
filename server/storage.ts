/**
 * WhoopsPay Database Storage Layer - OWASP Vulnerability Training Platform
 * 
 * WARNING: This file contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (No authorization checks, IDOR vulnerabilities)
 * - A02: Cryptographic Failures (Plain text sensitive data storage)
 * - A03: Injection (SQL injection via raw queries and dynamic construction)
 * - A04: Insecure Design (Missing business logic validation)
 * - A05: Security Misconfiguration (Verbose error messages, default configurations)
 * - A07: Identification and Authentication Failures (Weak session management)
 * - A09: Security Logging and Monitoring Failures (Insufficient audit logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API1: Broken Object Level Authorization (Direct object access without checks)
 * - API2: Broken User Authentication (Weak authentication mechanisms)
 * - API3: Broken Object Property Level Authorization (Excessive data exposure)
 * - API4: Unrestricted Resource Consumption (No rate limiting on database operations)
 * - API5: Broken Function Level Authorization (Missing role-based access control)
 * 
 * NEVER use this code in production environments!
 */

import {
  users,
  transactions,
  paymentMethods,
  userSessions,
  notifications,
  issueReports,
  moneyRequests,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type UserSession,
  type Notification,
  type InsertNotification,
  type IssueReport,
  type InsertIssueReport,
  type MoneyRequest,
  type InsertMoneyRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, isNotNull, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { logStore } from "./middleware/adminMiddleware";

// Database-only storage - all data operations use SQLite

// All data now comes from SQLite database

/**
 * Vulnerable storage interface - intentionally insecure for educational purposes
 */
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Vulnerable user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  getTestAccounts(): Promise<User[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getPendingTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: number, status: string): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Payment method operations
  addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  deletePaymentMethod(id: number): Promise<void>;
  
  // Session operations
  createUserSession(userId: string, sessionToken: string, ipAddress: string, userAgent: string): Promise<UserSession>;
  validateSession(sessionToken: string): Promise<UserSession | undefined>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteAllNotifications(userId: string): Promise<void>;
  
  // Issue Reports operations
  createIssueReport(report: InsertIssueReport): Promise<IssueReport>;
  getAllIssueReports(): Promise<IssueReport[]>;
  getUserIssueReports(userId: string): Promise<IssueReport[]>;
  getIssueReport(id: number): Promise<IssueReport | undefined>;
  updateIssueReportStatus(id: number, status: string, adminNotes?: string): Promise<IssueReport>;
  assignIssueReport(id: number, assignedTo: string): Promise<IssueReport>;

  // Money Request operations
  createMoneyRequest(request: InsertMoneyRequest): Promise<MoneyRequest>;
  getMoneyRequest(id: number): Promise<MoneyRequest | undefined>;
  getPendingMoneyRequests(userId: string): Promise<MoneyRequest[]>;
  updateMoneyRequestStatus(id: number, status: string): Promise<MoneyRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      logStore.addDbLog(`Fetching user by ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        logStore.addDbLog(`User found: ${user.id}`);
      } else {
        logStore.addDbLog(`User not found: ${id}`);
      }
      return user;
    } catch (error) {
      logStore.addDbLog(`Error fetching user: ${error}`);
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      logStore.addDbLog(`Upserting user: ${userData.id}`);
      const now = Date.now();
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: now,
          },
        })
        .returning();
      logStore.addDbLog(`User upserted successfully: ${user.id}`);
      return user;
    } catch (error) {
      logStore.addDbLog(`Error upserting user: ${error}`);
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  async createUser(userData: UpsertUser): Promise<User> {
    try {
      const now = Date.now();
      const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
      
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
          balance: userData.balance || 1000,
          isAdmin: userData.isAdmin || 0,
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return undefined;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      // Note: This intentionally uses string concatenation for educational vulnerability demonstration
      const result = await db.select().from(users);
      return result.filter(user => 
        user.firstName?.includes(query) || 
        user.lastName?.includes(query) || 
        user.email?.includes(query)
      );
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    try {
      const numericAmount = parseFloat(amount);
      console.log(`Updating balance for user ${userId} to ${numericAmount} (from string: ${amount})`);
      await db
        .update(users)
        .set({ balance: numericAmount, updatedAt: Date.now() })
        .where(eq(users.id, userId));
      console.log(`Balance update completed for user ${userId}`);
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw error;
    }
  }

  async getTestAccounts(): Promise<User[]> {
    try {
      const result = await db.select().from(users).limit(5);
      // VULNERABILITY: Return user credentials for educational testing - NEVER do this in production
      return result;
    } catch (error) {
      console.error("Error fetching test accounts:", error);
      return [];
    }
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    try {
      // Determine if transaction is ONUS or OFFUS
      const isInternalTransaction = this.isOnUsTransaction(transactionData);
      const transactionCategory = isInternalTransaction ? 'ONUS' : 'OFFUS';
      
      logStore.addDbLog(`Creating ${transactionCategory} transaction: ${transactionData.fromUserId} -> ${transactionData.toUserId || 'External'} (${transactionData.amount})`);
      
      const [transaction] = await db
        .insert(transactions)
        .values({
          ...transactionData,
          transactionCategory,
          isInternal: isInternalTransaction ? 1 : 0,
          networkCode: isInternalTransaction ? 'WHOOPS-INT' : transactionData.networkCode || 'EXT-NET',
          createdAt: Date.now(),
        })
        .returning();
      
      logStore.addDbLog(`${transactionCategory} transaction created successfully: ID ${transaction.id}`);
      return transaction;
    } catch (error) {
      logStore.addDbLog(`Error creating transaction: ${error}`);
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  private isOnUsTransaction(transactionData: InsertTransaction): boolean {
    // ONUS: Both fromUserId and toUserId exist and start with @ (WhoopsPay accounts)
    // OFFUS: toUserId is null/undefined or doesn't start with @ (external transaction)
    return !!(transactionData.toUserId && 
              transactionData.fromUserId?.startsWith('@') && 
              transactionData.toUserId.startsWith('@'));
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      logStore.addDbLog(`Fetching transactions for user: ${userId}`);
      const result = await db
        .select()
        .from(transactions)
        .where(
          or(
            eq(transactions.fromUserId, userId),
            eq(transactions.toUserId, userId)
          )
        )
        .orderBy(desc(transactions.createdAt));
      logStore.addDbLog(`Found ${result.length} transactions for user ${userId}`);
      return result;
    } catch (error) {
      logStore.addDbLog(`Error fetching user transactions: ${error}`);
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return undefined;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      return [];
    }
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'pending'),
            or(
              eq(transactions.fromUserId, userId),
              eq(transactions.toUserId, userId)
            )
          )
        );
      return result;
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      return [];
    }
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction> {
    try {
      const [transaction] = await db
        .update(transactions)
        .set({ status })
        .where(eq(transactions.id, transactionId))
        .returning();
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      return transaction;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      await db.delete(transactions).where(eq(transactions.id, id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethodData: InsertPaymentMethod): Promise<PaymentMethod> {
    try {
      const [paymentMethod] = await db
        .insert(paymentMethods)
        .values({
          ...paymentMethodData,
          createdAt: Date.now(),
        })
        .returning();
      return paymentMethod;
    } catch (error) {
      console.error("Error adding payment method:", error);
      throw error;
    }
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const result = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, userId));
      return result;
    } catch (error) {
      console.error("Error fetching user payment methods:", error);
      return [];
    }
  }

  async deletePaymentMethod(id: number): Promise<void> {
    try {
      await db
        .delete(paymentMethods)
        .where(eq(paymentMethods.id, id));
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw error;
    }
  }

  async createUserSession(userId: string, sessionToken: string, ipAddress: string, userAgent: string): Promise<UserSession> {
    try {
      const [session] = await db
        .insert(userSessions)
        .values({
          userId,
          sessionToken,
          ipAddress,
          userAgent,
          isActive: 1,
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        })
        .returning();
      return session;
    } catch (error) {
      console.error("Error creating user session:", error);
      throw error;
    }
  }

  async validateSession(sessionToken: string): Promise<UserSession | undefined> {
    try {
      const [session] = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.sessionToken, sessionToken),
            eq(userSessions.isActive, 1)
          )
        );
      return session;
    } catch (error) {
      console.error("Error validating session:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users);
      return result;
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await db
        .delete(users)
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          ...notificationData,
          createdAt: Date.now(),
        })
        .returning();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      await db
        .delete(notifications)
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  }

  // Issue Reports operations
  async createIssueReport(reportData: InsertIssueReport): Promise<IssueReport> {
    try {
      logStore.addDbLog(`Creating issue report for user: ${reportData.userId} - ${reportData.title}`);
      const [report] = await db
        .insert(issueReports)
        .values({
          ...reportData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .returning();
      logStore.addDbLog(`Issue report created successfully: ID ${report.id}`);
      return report;
    } catch (error) {
      logStore.addDbLog(`Error creating issue report: ${error}`);
      console.error("Error creating issue report:", error);
      throw error;
    }
  }

  async getAllIssueReports(): Promise<IssueReport[]> {
    try {
      const result = await db.select().from(issueReports).orderBy(issueReports.createdAt);
      return result;
    } catch (error) {
      console.error("Error fetching all issue reports:", error);
      return [];
    }
  }

  async getUserIssueReports(userId: string): Promise<IssueReport[]> {
    try {
      const result = await db
        .select()
        .from(issueReports)
        .where(eq(issueReports.userId, userId))
        .orderBy(issueReports.createdAt);
      return result;
    } catch (error) {
      console.error("Error fetching user issue reports:", error);
      return [];
    }
  }

  async getIssueReport(id: number): Promise<IssueReport | undefined> {
    try {
      const [report] = await db.select().from(issueReports).where(eq(issueReports.id, id));
      return report;
    } catch (error) {
      console.error("Error fetching issue report:", error);
      return undefined;
    }
  }

  async updateIssueReportStatus(id: number, status: string, adminNotes?: string): Promise<IssueReport> {
    try {
      const updateData: any = {
        status,
        updatedAt: Date.now(),
      };
      
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      if (status === 'resolved') {
        updateData.resolvedAt = Date.now();
      }
      
      const [report] = await db
        .update(issueReports)
        .set(updateData)
        .where(eq(issueReports.id, id))
        .returning();
      
      if (!report) {
        throw new Error('Issue report not found');
      }
      return report;
    } catch (error) {
      console.error("Error updating issue report status:", error);
      throw error;
    }
  }

  async assignIssueReport(id: number, assignedTo: string): Promise<IssueReport> {
    try {
      const [report] = await db
        .update(issueReports)
        .set({
          assignedTo,
          status: 'in_progress',
          updatedAt: Date.now(),
        })
        .where(eq(issueReports.id, id))
        .returning();
      
      if (!report) {
        throw new Error('Issue report not found');
      }
      return report;
    } catch (error) {
      console.error("Error assigning issue report:", error);
      throw error;
    }
  }

  // Money Requests operations for Juice Shop integration
  async createMoneyRequest(requestData: InsertMoneyRequest): Promise<MoneyRequest> {
    try {
      const [request] = await db
        .insert(moneyRequests)
        .values({
          ...requestData,
          createdAt: Date.now()
        })
        .returning();
      return request;
    } catch (error) {
      console.error("Error creating money request:", error);
      throw error;
    }
  }

  async getMoneyRequest(id: number): Promise<MoneyRequest | undefined> {
    try {
      const [request] = await db.select().from(moneyRequests).where(eq(moneyRequests.id, id));
      return request;
    } catch (error) {
      console.error("Error fetching money request:", error);
      return undefined;
    }
  }

  async getPendingMoneyRequests(userId: string): Promise<any[]> {
    try {
      console.log(`Fetching pending requests for user: ${userId}`);
      
      const result = await db
        .select({
          id: moneyRequests.id,
          fromUserId: moneyRequests.fromUserId,
          toUserId: moneyRequests.toUserId,
          amount: moneyRequests.amount,
          description: moneyRequests.description,
          status: moneyRequests.status,
          type: moneyRequests.type,
          createdAt: moneyRequests.createdAt,
          respondedAt: moneyRequests.respondedAt,
          externalOrderId: moneyRequests.externalOrderId,
          externalSource: moneyRequests.externalSource,
          returnUrl: moneyRequests.returnUrl,
          cancelUrl: moneyRequests.cancelUrl,
          // Join user information of the person requesting money
          fromUser: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(moneyRequests)
        .leftJoin(users, eq(moneyRequests.toUserId, users.id)) // Join with the person who made the request (toUserId)
        .where(and(
          eq(moneyRequests.fromUserId, userId), // Show requests where others want money FROM this user (fromUserId = current user)
          eq(moneyRequests.status, "pending")
        ))
        .orderBy(desc(moneyRequests.createdAt));
      
      console.log(`Found ${result.length} pending requests for user ${userId}:`, result.map(r => ({ id: r.id, fromUserId: r.fromUserId, toUserId: r.toUserId, amount: r.amount })));
      return result;
    } catch (error) {
      console.error("Error fetching pending money requests:", error);
      return [];
    }
  }

  async updateMoneyRequestStatus(id: number, status: string): Promise<MoneyRequest> {
    try {
      const [request] = await db
        .update(moneyRequests)
        .set({ 
          status,
          respondedAt: Date.now() 
        })
        .where(eq(moneyRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error("Error updating money request status:", error);
      throw error;
    }
  }

  /**
   * Delete money request by ID
   */
  async deleteMoneyRequest(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(moneyRequests)
        .where(eq(moneyRequests.id, id));
      
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting money request:", error);
      throw error;
    }
  }

  /**
   * Find unassigned external payment requests by order ID
   */
  async findUnassignedExternalRequest(orderId: string): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(moneyRequests)
        .where(and(
          eq(moneyRequests.toUserId, "pending-user-selection"),
          eq(moneyRequests.externalOrderId, orderId),
          eq(moneyRequests.status, "pending")
        ));
      
      return result;
    } catch (error) {
      console.error("Error finding unassigned external request:", error);
      return [];
    }
  }

  /**
   * Get ALL unassigned external payment requests
   */
  async getAllUnassignedExternalRequests(): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(moneyRequests)
        .where(and(
          eq(moneyRequests.toUserId, "pending-user-selection"),
          eq(moneyRequests.status, "pending")
        ));
      
      return result;
    } catch (error) {
      console.error("Error finding all unassigned external requests:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();