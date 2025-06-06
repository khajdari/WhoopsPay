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
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type UserSession,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

// Database-only storage - all data operations use PostgreSQL

// All data now comes from PostgreSQL database

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
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
      return user;
    } catch (error) {
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
      await db
        .update(users)
        .set({ balance: parseFloat(amount), updatedAt: Date.now() })
        .where(eq(users.id, userId));
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

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: mockTransactions.length + 1,
      ...transaction,
      createdAt: Date.now(),
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return mockTransactions.filter(t => t.fromUserId === userId || t.toUserId === userId);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return mockTransactions.find(t => t.id === id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return [...mockTransactions];
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    return mockTransactions.filter(t => t.status === 'pending' && (t.fromUserId === userId || t.toUserId === userId));
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction> {
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    transaction.status = status;
    return transaction;
  }

  async addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const newPaymentMethod: PaymentMethod = {
      id: mockPaymentMethods.length + 1,
      ...paymentMethod,
      createdAt: Date.now(),
    };
    mockPaymentMethods.push(newPaymentMethod);
    return newPaymentMethod;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return mockPaymentMethods.filter(pm => pm.userId === userId);
  }

  async deletePaymentMethod(id: number): Promise<void> {
    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index > -1) {
      mockPaymentMethods.splice(index, 1);
    }
  }

  async createUserSession(userId: string, sessionToken: string, ipAddress: string, userAgent: string): Promise<UserSession> {
    const session: UserSession = {
      id: mockSessions.length + 1,
      userId,
      sessionToken,
      ipAddress,
      userAgent,
      isActive: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    mockSessions.push(session);
    return session;
  }

  async validateSession(sessionToken: string): Promise<UserSession | undefined> {
    return mockSessions.find(s => s.sessionToken === sessionToken && s.isActive === 1);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(mockUsers.values());
  }

  async deleteUser(userId: string): Promise<void> {
    mockUsers.delete(userId);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: mockNotifications.length + 1,
      ...notification,
      createdAt: Date.now(),
    };
    mockNotifications.push(newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return mockNotifications.filter(n => n.userId === userId);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = 1;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = 1;
      }
    });
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    for (let i = mockNotifications.length - 1; i >= 0; i--) {
      if (mockNotifications[i].userId === userId) {
        mockNotifications.splice(i, 1);
      }
    }
  }
}

export const storage = new DatabaseStorage();