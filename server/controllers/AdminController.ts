/**
 * WhoopsPay Admin Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Weak admin verification, privilege escalation)
 * - A03: Injection (SQL injection in admin queries)
 * - A04: Insecure Design (Inadequate admin authorization framework)
 * - A05: Security Misconfiguration (Administrative functions exposed)
 * - A07: Identification and Authentication Failures (Session-based admin validation)
 * - A09: Security Logging and Monitoring Failures (Insufficient admin action logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API5: Broken Function Level Authorization (Weak role-based access control)
 * - API6: Unrestricted Access to Sensitive Business Flows (Admin functions)
 * - API8: Security Misconfiguration (Exposed administrative endpoints)
 * - API9: Improper Inventory Management (Exposed admin APIs)
 * 
 * Administrative Security Vulnerabilities:
 * - Session-based admin authentication (can be manipulated)
 * - No multi-factor authentication for admin functions
 * - Direct database access without proper validation
 * - Administrative privilege escalation opportunities
 * - Insufficient audit logging for admin actions
 * 
 * NEVER use this code in production environments!
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { logStore } from '../middleware/adminMiddleware';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import Database from 'better-sqlite3';

export class AdminController {
  /**
   * Get all users (admin only)
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (Weak admin verification)
   * - A07: Authentication Failures (Session-based admin check)
   * - API5: Broken Function Level Authorization
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      
      // OWASP A01: Broken Access Control & A07: Authentication Failures
      // CRITICAL VULNERABILITY: Weak admin verification that can be bypassed by:
      // - Session manipulation
      // - Privilege escalation through other vulnerabilities
      // - No server-side role validation
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }

  /**
   * Get all transactions (admin only)
   * VULNERABILITY: Weak admin verification
   */
  static async getAllTransactions(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      
      // VULNERABLE: Can be bypassed by modifying session
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  }

  /**
   * Update user balance (admin only)
   * VULNERABILITY: No input validation
   */
  static async updateUserBalance(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      const { userId, newBalance } = req.body;
      
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // OWASP A03: Injection & A04: Insecure Design
      // VULNERABLE: No input validation for balance amount
      // Admin can set negative balances, extremely high amounts, or invalid values
      if (!userId || newBalance === undefined) {
        return res.status(400).json({ message: "User ID and new balance are required" });
      }

      await storage.updateUserBalance(userId, newBalance.toString());
      
      res.json({ 
        message: "User balance updated successfully",
        userId,
        newBalance 
      });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ message: "Failed to update user balance" });
    }
  }

  /**
   * Delete user (admin only)
   * VULNERABILITY: No confirmation or audit trail
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      const { userId } = req.params;
      
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // VULNERABLE: No confirmation step or audit trail
      // VULNERABLE: No confirmation step or audit trail
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Note: deleteUser method would need to be implemented in storage

      res.json({ 
        message: "User deletion initiated successfully",
        userId: userId 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  }

  /**
   * Create system notification for all users
   * VULNERABILITY: No rate limiting
   */
  static async createSystemNotification(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      const { title, message, type } = req.body;
      
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }

      // VULNERABLE: No rate limiting - admin can spam notifications
      const users = await storage.getAllUsers();
      const notifications = [];

      for (const user of users) {
        const notification = await storage.createNotification({
          userId: user.id,
          type: type || "system",
          title,
          message,
          isRead: 0
        });
        notifications.push(notification);
      }

      res.json({
        message: `System notification sent to ${users.length} users`,
        notifications: notifications.length
      });
    } catch (error) {
      console.error("Error creating system notification:", error);
      res.status(500).json({ message: "Failed to create system notification" });
    }
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      
      if (!sessionUser?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const users = await storage.getAllUsers();
      const transactions = await storage.getAllTransactions();
      const pendingRequests = await storage.getPendingMoneyRequests("all");

      const stats = {
        totalUsers: users.length,
        totalTransactions: transactions.length,
        pendingRequests: pendingRequests.length,
        totalTransactionValue: transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
        completedTransactions: transactions.filter(t => t.status === 'completed').length,
        rejectedTransactions: transactions.filter(t => t.status === 'rejected').length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system statistics" });
    }
  }

  /**
   * Get Express server logs
   */
  static async getExpressLogs(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const logs = logStore.getExpressLogs();
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching Express logs:", error);
      res.status(500).json({ message: "Failed to fetch Express logs" });
    }
  }

  /**
   * Get database logs
   */
  static async getDatabaseLogs(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const logs = logStore.getDbLogs();
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching database logs:", error);
      res.status(500).json({ message: "Failed to fetch database logs" });
    }
  }

  /**
   * Get database tables with metadata
   */
  static async getDatabaseTables(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // Get the raw SQLite database connection
      const sqlite = (db as any).$client as Database.Database;
      
      // Get all table information from SQLite
      const tablesQuery = `
        SELECT name, sql 
        FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `;

      const tablesResult = sqlite.prepare(tablesQuery).all();
      
      const tables = [];
      
      for (const table of tablesResult as Array<{name: string, sql: string}>) {
        // Get column information
        const columnsQuery = `PRAGMA table_info(${table.name})`;
        const columns = sqlite.prepare(columnsQuery).all();
        
        // Get row count
        const countQuery = `SELECT COUNT(*) as count FROM ${table.name}`;
        const countResult = sqlite.prepare(countQuery).get() as { count: number };
        
        tables.push({
          name: table.name,
          columns: columns.map((col: any) => ({
            name: col.name,
            type: col.type,
            nullable: !col.notnull,
            primaryKey: col.pk === 1
          })),
          rowCount: countResult.count
        });
      }

      res.json(tables);
    } catch (error) {
      console.error("Error fetching database tables:", error);
      res.status(500).json({ message: "Failed to fetch database tables" });
    }
  }

  /**
   * Get table data
   */
  static async getTableData(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const { tableName } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Get the raw SQLite database connection
      const sqlite = (db as any).$client as Database.Database;
      
      // Validate table name to prevent injection
      const validTableQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=? AND name NOT LIKE 'sqlite_%'
      `;
      
      const tableExists = sqlite.prepare(validTableQuery).get(tableName);
      
      if (!tableExists) {
        return res.status(404).json({ message: "Table not found" });
      }

      // Get table data
      const dataQuery = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
      const rows = sqlite.prepare(dataQuery).all(limit, offset);
      
      // Get column information
      const columnsQuery = `PRAGMA table_info(${tableName})`;
      const columnInfo = sqlite.prepare(columnsQuery).all();
      
      const columns = columnInfo.map((col: any) => col.name);

      res.json({
        columns,
        rows: rows.map((row: any) => columns.map(col => Object.prototype.hasOwnProperty.call(row, col) ? row[col] : null)),
        totalRows: rows.length,
        limit,
        offset
      });
    } catch (error) {
      console.error("Error fetching table data:", error);
      res.status(500).json({ message: "Failed to fetch table data" });
    }
  }

  /**
   * Execute SQL query
   */
  static async executeSqlQuery(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "SQL query is required" });
      }

      // Get the raw SQLite database connection
      const sqlite = (db as any).$client as Database.Database;
      
      // Log the database operation
      logStore.addDbLog(`Admin ${user.id} executed query: ${query.substring(0, 100)}...`);

      const trimmedQuery = query.trim().toLowerCase();
      
      if (trimmedQuery.startsWith('select') || trimmedQuery.startsWith('with')) {
        // For SELECT queries, return the results
        const stmt = sqlite.prepare(query);
        const rows = stmt.all();
        
        let columns: string[] = [];
        if (rows.length > 0) {
          columns = Object.keys(rows[0]);
        }

        res.json({
          columns,
          rows: rows.map((row: any) => columns.map(col => Object.prototype.hasOwnProperty.call(row, col) ? row[col] : null)),
          rowsAffected: rows.length
        });
      } else {
        // For INSERT, UPDATE, DELETE, CREATE, DROP, etc.
        const stmt = sqlite.prepare(query);
        const result = stmt.run();
        
        res.json({
          columns: ['Result'],
          rows: [['Query executed successfully']],
          rowsAffected: result.changes || 0,
          lastInsertRowid: result.lastInsertRowid
        });
      }
    } catch (error: any) {
      console.error("Error executing SQL query:", error);
      
      // Log the error
      logStore.addDbLog(`SQL query error: ${error.message}`);
      
      res.json({
        columns: ['Error'],
        rows: [[error.message]],
        error: error.message
      });
    }
  }

  /**
   * Get system failures from logs
   * @route GET /api/admin/system-failures
   */
  static async getSystemFailures(req: Request, res: Response) {
    try {
      // Get user from request (set by isAuthenticated middleware)
      const user = (req as any).user;
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // Get recent errors from both express and database logs
      const expressLogs = logStore.getExpressLogs().slice(-100); // Last 100 entries
      const databaseLogs = logStore.getDbLogs().slice(-100); // Last 100 entries
      
      const failures: any[] = [];
      
      // Parse express logs for errors
      expressLogs.forEach(log => {
        if (log.includes('ERROR') || log.includes('error') || log.includes('500 in') || log.includes('ECONNREFUSED') || log.includes('ETIMEDOUT') || log.includes('Failed')) {
          const timeMatch = log.match(/\[([\d-T:.Z]+)\]/);
          const time = timeMatch ? new Date(timeMatch[1]) : new Date();
          
          // Extract error info
          let type = 'API Error';
          const logParts = log.split('] ');
          let message = logParts.length > 1 ? logParts[1] : log;
          let severity = 'medium';
          
          if (log.includes('500 in')) {
            type = 'Server Error';
            severity = 'high';
          } else if (log.includes('ECONNREFUSED')) {
            type = 'Connection Error';
            severity = 'critical';
          } else if (log.includes('ERROR') || log.includes('Failed')) {
            type = 'Application Error';
            severity = 'high';
          }
          
          failures.push({
            time: time.toISOString(),
            type,
            message: message.substring(0, 80) + (message.length > 80 ? '...' : ''),
            severity,
            source: 'express'
          });
        }
      });
      
      // Parse database logs for errors
      databaseLogs.forEach(log => {
        if (log.includes('ERROR') || log.includes('SQLITE_') || log.includes('database error') || log.includes('Failed')) {
          const timeMatch = log.match(/\[([\d-T:.Z]+)\]/);
          const time = timeMatch ? new Date(timeMatch[1]) : new Date();
          
          let type = 'Database Error';
          const logParts = log.split('] ');
          let message = logParts.length > 1 ? logParts[1] : log;
          let severity = 'high';
          
          if (log.includes('SQLITE_CORRUPT')) {
            severity = 'critical';
          } else if (log.includes('SQLITE_BUSY')) {
            severity = 'medium';
          }
          
          failures.push({
            time: time.toISOString(),
            type,
            message: message.substring(0, 80) + (message.length > 80 ? '...' : ''),
            severity,
            source: 'database'
          });
        }
      });
      
      // Sort by time (newest first) and limit to recent failures
      const recentFailures = failures
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
      
      res.json({ failures: recentFailures });
    } catch (error) {
      console.error('Failed to get system failures:', error);
      res.status(500).json({ message: 'Failed to get system failures' });
    }
  }
}