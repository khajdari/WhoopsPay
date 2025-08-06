import { Request, Response } from 'express';
import { storage } from '../storage';
import { logStore } from '../middleware/adminMiddleware';

export class AdminController {
  /**
   * Get all users (admin only)
   * VULNERABILITY: No proper admin authentication
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      
      // VULNERABLE: Basic admin check that can be bypassed
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

      // VULNERABLE: No input validation for balance amount
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
}