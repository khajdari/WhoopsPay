/**
 * Local Authentication System - Session-based user authentication
 * 
 * Provides secure session management, password hashing, and authentication
 * middleware for the WhoopsPay application. Designed for educational purposes
 * with intentional security vulnerabilities for training.
 */
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";

/**
 * Session Configuration - Sets up Express session middleware
 * 
 * Configures session storage with security settings appropriate for
 * local development. Uses secure cookies and proper TTL management.
 */
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week session duration
  
  return session({
    secret: process.env.SESSION_SECRET || 'whoopspay-local-dev-secret-key-change-in-production',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      httpOnly: true, // Prevent XSS attacks via JavaScript access
      secure: false, // Set to false for local development (use true for HTTPS)
      maxAge: sessionTtl, // Session expiration time
    },
  });
}

/**
 * Authentication Middleware - Validates user sessions
 * 
 * Checks for valid user session and attaches user object to request.
 * Returns 401 Unauthorized for invalid or missing sessions.
 * Essential for protecting authenticated routes throughout the application.
 */
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check if session exists and contains user ID
    if (req.session && req.session.userId) {
      req.user = { id: req.session.userId }; // Attach user to request object
      return next();
    }
    
    return res.status(401).json({ message: "Unauthorized - Please log in" });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Setup simple local authentication routes
export async function setupAuth(app: Express) {
  app.use(getSession());

  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Try to authenticate with database users first
      let user = await storage.getUser(username);
      
      // If not found by ID, try by email
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      // If still not found, check test accounts
      if (!user) {
        const testAccounts = await storage.getTestAccounts();
        user = testAccounts.find((u: any) => u.id === username || u.email === username);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = user.password === password || 
                             await bcrypt.compare(password, user.password || '');
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      // Check for Juice Shop payment parameters and create pending money request
      const { redirect, transactionId, amount, description, returnUrl, cancelUrl } = req.query;
      if (redirect === 'payment' && transactionId && amount) {
        try {
          // Create pending money request for the logged-in user
          const moneyRequest = await storage.createMoneyRequest({
            fromUserId: "juice-shop",
            toUserId: user.id,
            amount: parseFloat(amount as string),
            description: description as string || `Juice Shop Order #${transactionId}`,
            status: "pending",
            type: "external",
            externalOrderId: transactionId as string,
            externalSource: "juice-shop",
            returnUrl: returnUrl as string,
            cancelUrl: cancelUrl as string,
            externalMetadata: JSON.stringify({
              source: "juice-shop",
              orderId: transactionId,
              timestamp: Date.now()
            })
          });

          // Create notification for the user
          await storage.createNotification({
            userId: user.id,
            title: "New Payment Request",
            message: `You have a pending payment request from Juice Shop for $${amount}`,
            type: "payment_request"
          });

          res.json({ 
            message: "Login successful",
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              balance: user.balance,
              isAdmin: user.isAdmin
            },
            paymentRequest: {
              id: moneyRequest.id,
              amount: amount,
              description: description,
              redirect: true
            }
          });
        } catch (error) {
          console.error("Error creating payment request:", error);
          // Continue with normal login even if payment request creation fails
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
        }
      } else {
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
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Register endpoint for new users
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password for security
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName: firstName || username,
        lastName: lastName || '',
        password: hashedPassword,
        balance: 1000, // Starting balance for demo
        isAdmin: 0
      });

      // Set session
      req.session.userId = newUser.id;

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isAdmin: newUser.isAdmin
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}