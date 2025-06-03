import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin middleware to check if user has admin privileges
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from session (assuming you have session-based auth)
    const userId = (req as any).user?.id || req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from storage
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user is admin
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