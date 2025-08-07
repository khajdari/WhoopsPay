/**
 * WhoopsPay Admin Middleware - OWASP Vulnerability Training
 * 
 * WARNING: This middleware contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Session-based privilege validation)
 * - A07: Identification and Authentication Failures (Weak admin verification)
 * - A05: Security Misconfiguration (Basic role checking)
 * 
 * Educational Vulnerabilities Include:
 * - Session-based admin validation can be manipulated
 * - No multi-factor authentication for admin access
 * - Basic boolean flag for admin privileges
 * - Insufficient audit logging for admin actions
 * 
 * NEVER use this code in production environments!
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// OWASP A01: Broken Access Control - Weak Admin Privilege Validation
// VULNERABLE: Session-based admin checking without proper security controls
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // OWASP A07: Identification and Authentication Failures
    // VULNERABLE: Basic session-based authentication without additional security
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // VULNERABLE: Direct database lookup without additional validation
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // OWASP A01: Broken Access Control - Weak Privilege Validation
    // VULNERABLE: Simple boolean flag for admin privileges
    // - No role hierarchy or granular permissions
    // - Can be manipulated through other vulnerabilities
    // - No time-based or context-based access controls
    if (!user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Administrator privileges required.",
        code: "ADMIN_REQUIRED"
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Log storage for in-memory logging
class LogStore {
  private expressLogs: string[] = [];
  private dbLogs: string[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  addExpressLog(log: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${log}`;
    this.expressLogs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.expressLogs.length > this.maxLogs) {
      this.expressLogs.shift();
    }
  }

  addDbLog(log: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${log}`;
    this.dbLogs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.dbLogs.length > this.maxLogs) {
      this.dbLogs.shift();
    }
  }

  getExpressLogs() {
    return [...this.expressLogs].reverse(); // Most recent first
  }

  getDbLogs() {
    return [...this.dbLogs].reverse(); // Most recent first
  }
}

export const logStore = new LogStore();

// Express logging middleware
export const expressLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${req.method} ${req.originalUrl} ${res.statusCode} in ${duration}ms :: ${JSON.stringify(req.body).substring(0, 100)}${JSON.stringify(req.body).length > 100 ? '...' : ''}`;
    logStore.addExpressLog(log);
  });
  
  next();
};