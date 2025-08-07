/**
 * WhoopsPay Notification Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (IDOR, missing ownership validation)
 * - A04: Insecure Design (No proper authorization framework)
 * - A05: Security Misconfiguration (Excessive permissions)
 * - A09: Security Logging and Monitoring Failures (No access logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API1: Broken Object Level Authorization (No notification ownership checks)
 * - API5: Broken Function Level Authorization (Admin functions without validation)
 * - API3: Broken Object Property Level Authorization (Data exposure)
 * 
 * Educational Vulnerabilities Include:
 * - Anyone can mark any notification as read
 * - Anyone can delete any notification
 * - Anyone can create notifications for any user
 * - No ownership validation for notification operations
 * 
 * NEVER use this code in production environments!
 */

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
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (IDOR vulnerability)
   * - API1: Broken Object Level Authorization (No ownership validation)
   */
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // OWASP A01: Broken Access Control - Insecure Direct Object Reference
      // CRITICAL VULNERABILITY: No check if notification belongs to current user
      // This allows users to mark any notification as read, even those belonging to other users
      await storage.markNotificationAsRead(parseInt(notificationId));
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }

  /**
   * Delete notification
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (IDOR vulnerability)
   * - API1: Broken Object Level Authorization (No ownership validation)
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // OWASP A01: Broken Access Control - Multiple Vulnerabilities
      // CRITICAL VULNERABILITY #1: No check if notification belongs to current user
      // CRITICAL VULNERABILITY #2: Direct deletion without ownership validation
      // This allows users to delete any notification, potentially disrupting other users
      // Note: deleteNotification method would need to be implemented
      
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  }

  /**
   * Create notification (admin function)
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (No admin authorization)
   * - API5: Broken Function Level Authorization (Missing role validation)
   * - A04: Insecure Design (No notification rate limiting)
   */
  static async createNotification(req: Request, res: Response) {
    try {
      const { userId, type, title, message } = req.body;
      
      // OWASP A01: Broken Access Control & API5: Broken Function Level Authorization
      // CRITICAL VULNERABILITY: No admin authorization check
      // Anyone can create notifications for any user, enabling spam or social engineering attacks
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