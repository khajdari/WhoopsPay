import { Request, Response } from 'express';
import { storage } from '../storage';

export class NotificationController {
  /**
   * Get all notifications for current user
   */
  static async getUserNotifications(req: Request, res: Response) {
    try {
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  /**
   * Mark notification as read
   * VULNERABILITY: No ownership validation
   */
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // VULNERABLE: No check if notification belongs to current user
      await storage.markNotificationAsRead(parseInt(notificationId));
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }

  /**
   * Delete notification
   * VULNERABILITY: No ownership validation
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // VULNERABLE: No check if notification belongs to current user
      // VULNERABLE: Direct deletion without ownership check
      // Note: deleteNotification method would need to be implemented
      
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  }

  /**
   * Create notification (admin function)
   * VULNERABILITY: No admin check
   */
  static async createNotification(req: Request, res: Response) {
    try {
      const { userId, type, title, message } = req.body;
      
      // VULNERABLE: No admin authorization check
      if (!userId || !title || !message) {
        return res.status(400).json({ message: "User ID, title, and message are required" });
      }

      const notification = await storage.createNotification({
        userId,
        type: type || "general",
        title,
        message,
        isRead: 0
      });

      res.json({
        message: "Notification created successfully",
        notification
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  }
}