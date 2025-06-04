/**
 * PayPwned Database Schema - OWASP Security Training Platform
 * 
 * WARNING: This schema contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A02: Cryptographic Failures (Plain text storage of sensitive data)
 * - A03: Injection (Vulnerable column types and lack of input validation)
 * - A04: Insecure Design (Missing security constraints and proper relationships)
 * - A05: Security Misconfiguration (Permissive table structures)
 * - A07: Identification and Authentication Failures (Weak password storage)
 * 
 * Educational Vulnerabilities Include:
 * - Plain text password storage (users.password)
 * - Unencrypted sensitive data (SSN, bank accounts, credit cards)
 * - Missing proper foreign key constraints
 * - Excessive data exposure through unrestricted columns
 * - No data classification or sensitivity markers
 * - Vulnerable session storage design
 * 
 * NEVER use this schema in production environments!
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Session storage table for Replit Auth
 * VULNERABILITY: Sessions stored in database without proper encryption
 */
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// User storage table with vulnerable design
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
  // VULNERABILITY: Plain text password storage
  password: text("password"),
  // VULNERABILITY: Unencrypted sensitive personal data
  ssn: text("ssn"),
  phone: text("phone"),
  address: text("address"),
  balance: real("balance"),
  // VULNERABILITY: Weak role management
  isAdmin: integer("is_admin"),
});

// Transaction table with security flaws
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  status: text("status"),
  type: text("type"),
  createdAt: integer("created_at"),
});

// Payment methods with exposed sensitive data
export const paymentMethods = sqliteTable("payment_methods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'card' or 'bank'
  // VULNERABILITY: Unencrypted payment data
  cardNumber: text("card_number"),
  cardName: text("card_name"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  iban: text("iban"),
  isDefault: integer("is_default"),
  createdAt: integer("created_at"),
});

// Vulnerable session tracking
export const userSessions = sqliteTable("user_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  sessionToken: text("session_token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: integer("is_active"),
  createdAt: integer("created_at"),
  expiresAt: integer("expires_at"),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  isRead: integer("is_read"),
  createdAt: integer("created_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;