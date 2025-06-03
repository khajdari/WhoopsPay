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
import { eq, desc, sql, and } from "drizzle-orm";

// Vulnerable storage interface - intentionally insecure for educational purposes
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Vulnerable user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>; // Vulnerable to SQL injection
  updateUserBalance(userId: string, amount: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>; // Vulnerable to IDOR
  getAllTransactions(): Promise<Transaction[]>; // Vulnerable: no access control
  getPendingTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: number, status: string): Promise<Transaction>;
  
  // Payment method operations
  addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  deletePaymentMethod(id: number): Promise<void>; // Vulnerable to IDOR
  
  // Session operations (vulnerable)
  createUserSession(userId: string, sessionToken: string, ipAddress: string, userAgent: string): Promise<UserSession>;
  validateSession(sessionToken: string): Promise<UserSession | undefined>;
  
  // Admin operations (vulnerable access control)
  getAllUsers(): Promise<User[]>; // Should require admin check
  deleteUser(userId: string): Promise<void>; // Should require admin check
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteAllNotifications(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // VULNERABLE: SQL Injection vulnerability
  async searchUsers(query: string): Promise<User[]> {
    // WARNING: This is intentionally vulnerable to SQL injection
    // In a real app, this would use parameterized queries
    const rawQuery = sql.raw(`
      SELECT * FROM users 
      WHERE first_name ILIKE '%${query}%' 
      OR last_name ILIKE '%${query}%' 
      OR email ILIKE '%${query}%'
    `);
    
    try {
      const result = await db.execute(rawQuery);
      return result.rows as User[];
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: amount })
      .where(eq(users.id, userId));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        sql`${transactions.fromUserId} = ${userId} OR ${transactions.toUserId} = ${userId}`
      )
      .orderBy(desc(transactions.createdAt));
  }

  // VULNERABLE: Insecure Direct Object Reference
  async getTransaction(id: number): Promise<Transaction | undefined> {
    // WARNING: No authorization check - any user can access any transaction
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  // VULNERABLE: Missing access control
  async getAllTransactions(): Promise<Transaction[]> {
    // WARNING: This should require admin privileges
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(eq(transactions.toUserId, userId), eq(transactions.status, "pending")))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, transactionId))
      .returning();
    return transaction;
  }

  // Payment method operations
  async addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    return newPaymentMethod;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }

  // VULNERABLE: Insecure Direct Object Reference
  async deletePaymentMethod(id: number): Promise<void> {
    // WARNING: No ownership verification - any user can delete any payment method
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Session operations (vulnerable implementation)
  async createUserSession(userId: string, sessionToken: string, ipAddress: string, userAgent: string): Promise<UserSession> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const [session] = await db
      .insert(userSessions)
      .values({
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        expiresAt,
      })
      .returning();
    return session;
  }

  async validateSession(sessionToken: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          eq(userSessions.isActive, true)
        )
      );
    return session;
  }

  // VULNERABLE: Admin operations without proper access control
  async getAllUsers(): Promise<User[]> {
    // WARNING: This should require admin privileges but doesn't check
    return await db.select().from(users);
  }

  async deleteUser(userId: string): Promise<void> {
    // WARNING: This should require admin privileges but doesn't check
    await db.delete(users).where(eq(users.id, userId));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
