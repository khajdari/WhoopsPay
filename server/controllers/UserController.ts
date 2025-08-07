/**
 * WhoopsPay User Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (IDOR, missing authorization checks)
 * - A03: Injection (Potential for parameter pollution)
 * - A04: Insecure Design (No proper authorization framework)
 * - A05: Security Misconfiguration (Excessive data exposure)
 * - A09: Security Logging and Monitoring Failures (No access logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API1: Broken Object Level Authorization (Direct object references)
 * - API3: Broken Object Property Level Authorization (Excessive data exposure)
 * - API5: Broken Function Level Authorization (Missing role checks)
 * - API6: Unrestricted Access to Sensitive Business Flows (No business logic validation)
 * 
 * Educational Vulnerabilities Include:
 * - Insecure Direct Object References (IDOR)
 * - Missing authentication and authorization checks
 * - Excessive data exposure in API responses
 * - No input validation or sanitization
 * - Lack of business logic validation
 * 
 * NEVER use this code in production environments!
 */

import { Request, Response } from 'express';
import { storage } from '../storage';

export class UserController {
  /**
   * Get user profile
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (IDOR vulnerability)
   * - API1: Broken Object Level Authorization (No ownership validation)
   * - API3: Excessive Data Exposure (Returning sensitive information)
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // OWASP A01: Broken Access Control - Insecure Direct Object Reference (IDOR)
      // CRITICAL VULNERABILITY: No authorization check - any user can access any profile
      // This violates the principle of object-level authorization
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // OWASP API3: Broken Object Property Level Authorization
      // CRITICAL VULNERABILITY: Exposing sensitive information without access control
      res.json({
        id: user.id,
        email: user.email,                    // VULNERABLE: PII exposure
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,                // CRITICAL: Financial data exposure
        isAdmin: user.isAdmin,                // CRITICAL: Privilege escalation risk
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
        // Note: More sensitive fields like SSN, address are not exposed here
        // but the core vulnerability remains - no authorization check
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  }

  /**
   * Update user profile
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (No authentication/authorization)
   * - A03: Injection (No input validation)
   * - A04: Insecure Design (Mass assignment vulnerability)
   * - API1: Broken Object Level Authorization
   * - API6: Mass Assignment (No property filtering)
   */
  static async updateUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      // OWASP A01: Broken Access Control
      // CRITICAL VULNERABILITY: No authentication or authorization check
      // Anyone can update any user's profile without being logged in
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // OWASP A03: Injection & A04: Insecure Design
      // CRITICAL VULNERABILITY: Mass Assignment Attack
      // No input validation - users can set any fields including:
      // - balance (privilege escalation)
      // - isAdmin (privilege escalation)
      // - any other sensitive fields
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
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (No admin authorization)
   * - API5: Broken Function Level Authorization (Missing role validation)
   * - API3: Excessive Data Exposure (All user data exposed)
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