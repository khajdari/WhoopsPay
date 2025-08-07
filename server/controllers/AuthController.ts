/**
 * WhoopsPay Authentication Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (No rate limiting, session fixation)
 * - A02: Cryptographic Failures (Mixed plain text and hashed passwords)
 * - A04: Insecure Design (Weak authentication flow)
 * - A07: Identification and Authentication Failures (Account enumeration, weak session management)
 * - A09: Security Logging and Monitoring Failures (Insufficient audit logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API2: Broken User Authentication (No rate limiting, weak password policies)
 * - API4: Unrestricted Resource Consumption (No brute force protection)
 * - API8: Security Misconfiguration (Verbose error messages)
 * 
 * Educational Vulnerabilities Include:
 * - Account enumeration through login timing differences
 * - Mixed plain text and encrypted password storage
 * - No rate limiting or brute force protection
 * - Session management without proper security headers
 * - Verbose error messages revealing system information
 * 
 * NEVER use this code in production environments!
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcrypt';

export class AuthController {
  /**
   * User login endpoint
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A07: Identification and Authentication Failures (Account enumeration)
   * - A01: Broken Access Control (No rate limiting)
   * - A02: Cryptographic Failures (Mixed password storage)
   * - API2: Broken User Authentication (No brute force protection)
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // OWASP A07: Account Enumeration Vulnerability
      // VULNERABLE: Using email as username lookup enables account enumeration attacks
      // Attackers can determine which email addresses have accounts by response timing
      const user = await storage.getUserByEmail(username);
      if (!user) {
        // VULNERABILITY: Immediate response reveals account doesn't exist
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // OWASP A02: Cryptographic Failures - Mixed Password Storage
      // VULNERABLE: Some users have plain text passwords for demonstration purposes
      let isValidPassword = false;
      if (user.password.startsWith('$2b$')) {
        // Properly encrypted password using bcrypt
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // CRITICAL VULNERABILITY: Plain text password comparison
        // This demonstrates A02: Cryptographic Failures
        isValidPassword = password === user.password;
      }

      if (!isValidPassword) {
        // OWASP A09: Security Logging and Monitoring Failures
        // VULNERABLE: No failed login attempt logging or monitoring
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // OWASP A07: Session Management Vulnerabilities
      // VULNERABLE: Basic session storage without proper security headers
      (req as any).session.userId = user.id;

      // OWASP API3: Excessive Data Exposure
      // VULNERABLE: Returning sensitive data in login response
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance, // VULNERABLE: Exposing financial data
          isAdmin: user.isAdmin  // VULNERABLE: Exposing privilege level
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * User logout endpoint
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A07: Identification and Authentication Failures (Improper session termination)
   * - A05: Security Misconfiguration (Verbose error handling)
   */
  static async logout(req: Request, res: Response) {
    try {
      // OWASP A07: Session Management Vulnerability
      // VULNERABLE: Basic session destruction without proper cleanup
      (req as any).session.destroy((err: any) => {
        if (err) {
          // OWASP A05: Security Misconfiguration - Verbose Error Messages
          // VULNERABLE: Exposing internal error details to client
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      // OWASP A09: Security Logging and Monitoring Failures
      // VULNERABLE: Generic error handling without proper security logging
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // Get fresh user data from storage
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        balance: user.balance,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get user information" });
    }
  }
}