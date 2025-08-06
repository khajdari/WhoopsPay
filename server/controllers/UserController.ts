import { Request, Response } from 'express';
import { storage } from '../storage';

export class UserController {
  /**
   * Get user profile
   * VULNERABILITY: Direct object reference without authorization check
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // VULNERABLE: Direct object reference - no authorization check
      // Any user can access any other user's profile
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // VULNERABLE: Returning sensitive information without proper access control
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance, // VULNERABLE: Exposing balance to anyone
        isAdmin: user.isAdmin, // VULNERABLE: Exposing admin status
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  }

  /**
   * Update user profile
   * VULNERABILITY: No authentication or authorization
   */
  static async updateUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      // VULNERABLE: No authentication or authorization check
      // Anyone can update any user's profile
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // VULNERABLE: No input validation - users can set any fields
      // VULNERABLE: Direct update without validation
      const updatedUser = { ...existingUser, ...updateData };
      // Note: updateUser method would need to be implemented in storage
      
      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  }

  /**
   * Get all users (admin function)
   * VULNERABILITY: No admin check
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      // VULNERABLE: No admin authorization check
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }

  /**
   * Get test accounts for development
   * VULNERABILITY: Exposes all test account credentials
   */
  static async getTestAccounts(req: Request, res: Response) {
    try {
      // VULNERABLE: Returns all test accounts with passwords
      const testAccounts = await storage.getTestAccounts();
      res.json(testAccounts);
    } catch (error) {
      console.error("Error fetching test accounts:", error);
      res.status(500).json({ message: "Failed to fetch test accounts" });
    }
  }

  /**
   * Get user notifications
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
   */
  static async markNotificationRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // VULNERABLE: No authorization check - any logged-in user can mark any notification as read
      await storage.markNotificationAsRead(parseInt(notificationId));
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }

  /**
   * Get user payment methods
   */
  static async getUserPaymentMethods(req: Request, res: Response) {
    try {
      // Use the user set by isAuthenticated middleware
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      const paymentMethods = await storage.getUserPaymentMethods(user.id);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  }
}