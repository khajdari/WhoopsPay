import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  decimal,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with vulnerable design
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  address: varchar("address"),
  nationality: varchar("nationality"), 
  gender: varchar("gender"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  // Vulnerable: storing sensitive data without encryption
  ssn: varchar("ssn"), // Social Security Number - should be encrypted
  bankAccount: varchar("bank_account"), // Bank account - should be encrypted
  creditCard: varchar("credit_card"), // Credit card - should be encrypted
  password: varchar("password"), // Vulnerable: plain text password storage
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table with vulnerable access controls
export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"), // Vulnerable to XSS
  status: varchar("status").default("completed"), // "completed", "pending", "rejected"
  type: varchar("type").default("transfer"), // "transfer", "request"
  // Vulnerable: no proper access control checks
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment methods with insecure storage
export const paymentMethods = pgTable("payment_methods", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type"), // bank, card
  bankName: varchar("bank_name"), // Bank name for display
  cardName: varchar("card_name"), // Card holder name
  accountNumber: varchar("account_number"), // Vulnerable: not encrypted
  iban: varchar("iban"), // Vulnerable: not encrypted
  cardNumber: varchar("card_number"), // Vulnerable: not encrypted
  expiryDate: varchar("expiry_date"), // Vulnerable: not encrypted
  cvv: varchar("cvv"), // Vulnerable: not encrypted
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions for tracking (vulnerable implementation)
export const userSessions = pgTable("user_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  sessionToken: varchar("session_token"), // Vulnerable: predictable tokens
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Notifications table for database-backed notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export schemas for validation
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

// Types
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
