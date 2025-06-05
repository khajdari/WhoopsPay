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

// In-memory storage for demonstration
const mockUsers = new Map<string, User>();
const mockTransactions: Transaction[] = [];
const mockPaymentMethods: PaymentMethod[] = [];
const mockNotifications: Notification[] = [];
const mockSessions: UserSession[] = [];

// Initialize with demo data
const demoUser: User = {
  id: "jdoe",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  profileImageUrl: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  password: "password123",
  ssn: "123-45-6789",
  phone: "+1234567890",
  address: "123 Main St, City, State",
  balance: 2500.75,
  isAdmin: 0
};

const adminUser: User = {
  id: "admin",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  profileImageUrl: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  password: "admin123",
  ssn: "987-65-4321",
  phone: "+9876543210",
  address: "456 Admin Ave, City, State",
  balance: 10000.00,
  isAdmin: 1
};

mockUsers.set("jdoe", demoUser);
mockUsers.set("admin", adminUser);

// Demo transactions
mockTransactions.push(
  {
    id: 1,
    fromUserId: "jdoe",
    toUserId: "admin",
    amount: 150.00,
    description: "Payment for services",
    status: "completed",
    type: "transfer",
    createdAt: Date.now() - 86400000
  },
  {
    id: 2,
    fromUserId: "admin",
    toUserId: "jdoe",
    amount: 500.00,
    description: "Refund",
    status: "pending",
    type: "request",
    createdAt: Date.now() - 3600000
  }
);

// Demo payment methods
mockPaymentMethods.push(
  {
    id: 1,
    userId: "jdoe",
    type: "card",
    cardNumber: "4111111111111111",
    cardName: "John Doe",
    bankName: null,
    accountNumber: null,
    iban: null,
    isDefault: 1,
    createdAt: Date.now()
  },
  {
    id: 2,
    userId: "jdoe",
    type: "bank",
    cardNumber: null,
    cardName: null,
    bankName: "First National Bank",
    accountNumber: "123456789",
    iban: "GB33BUKB20201555555555",
    isDefault: 0,
    createdAt: Date.now()
  }
);

// Demo notifications
mockNotifications.push(
  {
    id: 1,
    userId: "jdoe",
    title: "Payment Received",
    message: "You received $500.00 from Admin User",
    type: "payment",
    isRead: 0,
    createdAt: Date.now() - 1800000
  },
  {
    id: 2,
    userId: "jdoe",
    title: "Money Request",
    message: "Admin User is requesting $500.00",
    type: "request",
    isRead: 0,
    createdAt: Date.now() - 900000
  }
);

/**
 * Vulnerable storage interface - intentionally insecure for educational purposes
 */
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vulnerable user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  
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
    return mockUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = Date.now();
    const user: User = {
      ...userData,
      id: userData.id || 'user1',
      createdAt: now,
      updatedAt: now,
      balance: userData.balance || 1000,
      isAdmin: userData.isAdmin || 0,
    };
    mockUsers.set(user.id, user);
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const now = Date.now();
    const user: User = {
      ...userData,
      createdAt: now,
      updatedAt: now,
      profileImageUrl: null,
      ssn: null,
      phone: null,
      address: null,
      balance: userData.balance || 1000,
      isAdmin: userData.isAdmin || 0,
    };
    mockUsers.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async searchUsers(query: string): Promise<User[]> {
    const results: User[] = [];
    for (const user of mockUsers.values()) {
      if (user.firstName?.includes(query) || user.lastName?.includes(query) || user.email?.includes(query)) {
        results.push(user);
      }
    }
    return results;
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    const user = mockUsers.get(userId);
    if (user) {
      user.balance = parseFloat(amount);
      mockUsers.set(userId, user);
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