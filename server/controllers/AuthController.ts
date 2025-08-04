import { Request, Response } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcrypt';

export class AuthController {
  /**
   * User login endpoint
   * VULNERABILITY: Basic authentication without proper rate limiting
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // VULNERABLE: Using email as username lookup - potential for enumeration
      const user = await storage.getUserByEmail(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // VULNERABLE: Some users have plain text passwords for demonstration
      let isValidPassword = false;
      if (user.password.startsWith('$2b$')) {
        // Encrypted password
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // VULNERABLE: Plain text password comparison
        isValidPassword = password === user.password;
      }

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      (req as any).session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * User logout endpoint
   */
  static async logout(req: Request, res: Response) {
    try {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Unauthorized - Please log in" });
      }

      // Get fresh user data from storage
      const user = await storage.getUser(sessionUser.id);
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