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

      // Demo users for local development
      const demoUsers = [
        {
          id: 'jdoe',
          username: 'jdoe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
          balance: 2500.75,
          isAdmin: 0
        },
        {
          id: 'admin',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'admin123',
          balance: 10000.00,
          isAdmin: 1
        },
        {
          id: 'alice',
          username: 'alice',
          email: 'alice.smith@example.com',
          firstName: 'Alice',
          lastName: 'Smith',
          password: 'alice123',
          balance: 1750.50,
          isAdmin: 0
        },
        {
          id: 'bob',
          username: 'bob',
          email: 'bob.johnson@example.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          password: 'bob123',
          balance: 3200.25,
          isAdmin: 0
        },
        {
          id: 'charlie',
          username: 'charlie',
          email: 'charlie.brown@example.com',
          firstName: 'Charlie',
          lastName: 'Brown',
          password: 'charlie123',
          balance: 890.75,
          isAdmin: 0
        }
      ];

      // Check demo users first
      const demoUser = demoUsers.find(u => u.username === username && u.password === password);
      if (demoUser) {
        req.session.userId = demoUser.id;
        
        return res.json({ 
          message: "Login successful",
          user: {
            id: demoUser.id,
            email: demoUser.email,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            balance: demoUser.balance,
            isAdmin: demoUser.isAdmin
          }
        });
      }

      // Try database users by username (ID) first
      let user = await storage.getUser(username);
      
      // If not found by ID, try by email
      if (!user) {
        user = await storage.getUserByEmail(username);
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