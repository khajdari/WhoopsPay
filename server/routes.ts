import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertPaymentMethodSchema } from "@shared/schema";
import { seedMockData } from "./mockData";
import { requireAdmin, logStore, expressLogger } from "./adminMiddleware";
import { z } from "zod";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export async function registerRoutes(app: Express): Promise<Server> {
  // Add express logging middleware
  app.use(expressLogger);
  
  // Seed mock data for vulnerability testing
  await seedMockData();

  // Swagger configuration
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PayPwned API - Vulnerability Testing',
        version: '1.0.0',
        description: 'API documentation for PayPwned - Contains intentional security vulnerabilities for educational purposes',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server',
        },
      ],
    },
    apis: ['./server/routes.ts'], // Path to the API docs
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PayPwned API Documentation'
  }));

  // VULNERABLE: Local login for test users (no proper security)
  // VULNERABLE: Signup endpoint (no input validation, allows duplicate emails)
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, firstName, lastName, password } = req.body;
      
      // VULNERABLE: No input validation
      // VULNERABLE: No password strength requirements
      // VULNERABLE: Passwords stored in plain text
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // VULNERABLE: No check for existing email addresses
      const newUser = {
        id: email.split('@')[0], // VULNERABLE: Predictable user ID generation
        email,
        firstName,
        lastName,
        balance: "0.00"
      };

      await storage.upsertUser(newUser);

      res.json({ 
        success: true, 
        message: "Account created successfully",
        user: newUser
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/local-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // VULNERABLE: Plain text password comparison
      const testUsers = [
        { username: 'jdoe', password: 'pass', id: 'jdoe' },
        { username: 'mdoe', password: 'pass', id: 'mdoe' },
        { username: 'edoe', password: 'pass', id: 'edoe' },
        { username: 'admin', password: 'Admin', id: 'admin' }
      ];
      
      const user = testUsers.find(u => u.username === username && u.password === password);
      
      if (user) {
        const fullUser = await storage.getUser(user.id);
        if (fullUser) {
          // VULNERABLE: No proper session management, just returning user data
          res.json({ success: true, user: fullUser });
        } else {
          res.status(404).json({ success: false, message: "User not found in database" });
        }
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Local login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  /**
   * @swagger
   * /api/users/search:
   *   get:
   *     summary: Search users (VULNERABLE - SQL Injection)
   *     description: "🚨 VULNERABILITY: SQL Injection - Query parameter passed directly to database without sanitization"
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query (vulnerable to SQL injection)
   *         example: "' OR 1=1--"
   *     responses:
   *       200:
   *         description: User search results (exposes sensitive data)
   */
  // VULNERABLE: User search with SQL injection
  app.get('/api/users/search', async (req: any, res) => {
    try {
      const query = req.query.q as string;
      
      // WARNING: This endpoint is vulnerable to SQL injection
      // The query parameter is passed directly to the vulnerable searchUsers method
      const users = await storage.searchUsers(query || '');
      
      // VULNERABLE: Exposing sensitive user data
      res.json(users);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  /**
   * @swagger
   * /api/admin/users:
   *   get:
   *     summary: Get all users (VULNERABLE - No Authentication)
   *     description: "🚨 VULNERABILITY: Missing authentication and authorization checks. Exposes all user data including SSNs, passwords, and financial info"
   *     tags: [Admin]
   *     responses:
   *       200:
   *         description: All users with sensitive data exposed
   */
  // VULNERABLE: Admin endpoint without proper access control
  app.get('/api/admin/users', async (req: any, res) => {
    try {
      // WARNING: Missing authentication and authorization checks
      // Any user can access this admin endpoint
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   delete:
   *     summary: Delete user (VULNERABLE - Admin Bypass)
   *     description: "🚨 VULNERABILITY: Missing authentication and authorization - anyone can delete users"
   *     tags: [Admin]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID to delete
   *         example: "jdoe"
   *     responses:
   *       200:
   *         description: User deleted successfully
   */
  // VULNERABLE: Admin delete endpoint without proper access control
  app.delete('/api/admin/users/:id', async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // WARNING: Missing authentication and authorization checks
      // Any user can delete any user account
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  /**
   * @swagger
   * /api/transactions:
   *   post:
   *     summary: Create transaction (VULNERABLE - No Balance Validation)
   *     description: "🚨 VULNERABILITY: No authentication, no balance validation - users can send money they don't have"
   *     tags: [Transactions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fromUserId:
   *                 type: string
   *                 example: "mdoe"
   *               toUserId:
   *                 type: string
   *                 example: "jdoe"
   *               amount:
   *                 type: string
   *                 example: "999999.99"
   *               description:
   *                 type: string
   *                 example: "Test transfer"
   *   get:
   *     summary: Get all transactions (VULNERABLE - No Auth)
   *     description: "🚨 VULNERABILITY: Returns all transactions without authentication"
   *     tags: [Transactions]
   */
  // Transaction endpoints
  app.post('/api/transactions', async (req: any, res) => {
    try {
      // VULNERABLE: No authentication check - anyone can create transactions
      const { fromUserId } = req.body;
      
      // VULNERABLE: Insufficient input validation
      const transactionData = req.body;
      
      // WARNING: No validation of transaction limits or user permissions
      // Users can send any amount, even if they don't have sufficient balance
      
      // Ensure both users exist before creating transaction
      const fromUser = await storage.getUser(transactionData.fromUserId);
      const toUser = await storage.getUser(transactionData.toUserId);
      
      if (!fromUser) {
        return res.status(400).json({ message: "Sender user not found" });
      }
      if (!toUser) {
        return res.status(400).json({ message: "Recipient user not found" });
      }
      
      const transaction = await storage.createTransaction({
        fromUserId: transactionData.fromUserId,
        toUserId: transactionData.toUserId,
        amount: transactionData.amount,
        description: transactionData.description || "",
        status: "completed"
      });

      // Update balances without proper checks
      if (transactionData.fromUserId && transactionData.toUserId && transactionData.amount) {
        const fromBalance = parseFloat(fromUser.balance || '0') - parseFloat(transactionData.amount);
        const toBalance = parseFloat(toUser.balance || '0') + parseFloat(transactionData.amount);
        
        // VULNERABLE: No checks for negative balances
        await storage.updateUserBalance(transactionData.fromUserId, fromBalance.toString());
        await storage.updateUserBalance(transactionData.toUserId, toBalance.toString());

        // Create notifications for both users
        try {
          // Notification for sender
          await storage.createNotification({
            userId: transactionData.fromUserId,
            type: "payment",
            title: "Payment Sent",
            message: `You sent $${transactionData.amount} to ${toUser.firstName} ${toUser.lastName}`,
            read: false
          });

          // Notification for receiver
          await storage.createNotification({
            userId: transactionData.toUserId,
            type: "payment",
            title: "Payment Received",
            message: `You received $${transactionData.amount} from ${fromUser.firstName} ${fromUser.lastName}`,
            read: false
          });
        } catch (notificationError) {
          console.error("Error creating notifications:", notificationError);
          // Continue without failing the transaction
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions', async (req: any, res) => {
    try {
      // VULNERABLE: No authentication - returns all transactions
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  /**
   * @swagger
   * /api/transactions/{id}:
   *   get:
   *     summary: Get transaction by ID (VULNERABLE - IDOR)
   *     description: "🚨 VULNERABILITY: Insecure Direct Object Reference - no authorization checks, can access any transaction by guessing ID"
   *     tags: [Transactions]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Transaction ID
   *         example: 661
   *     responses:
   *       200:
   *         description: Transaction details (accessible to anyone)
   */
  // VULNERABLE: Insecure Direct Object Reference
  app.get('/api/transactions/:id', async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      // WARNING: No authentication or authorization checks
      // Any user can access any transaction by guessing the ID
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  /**
   * @swagger
   * /api/admin/transactions:
   *   get:
   *     summary: Get all transactions (VULNERABLE - Admin Bypass)
   *     description: "🚨 VULNERABILITY: Missing authentication and authorization checks for admin endpoint"
   *     tags: [Admin]
   *     responses:
   *       200:
   *         description: All transactions in the system
   */
  // VULNERABLE: Admin endpoint exposing all transactions
  app.get('/api/admin/transactions', async (req: any, res) => {
    try {
      // WARNING: Missing authentication and authorization checks
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  /**
   * @swagger
   * /api/payments:
   *   post:
   *     summary: Add payment (VULNERABLE - No Auth + Plain Text Storage)
   *     description: "🚨 VULNERABILITIES: No authentication check, stores credit card numbers and CVV in plain text"
   *     tags: [Payments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [card, bank]
   *               cardNumber:
   *                 type: string
   *                 example: "4111-1111-1111-1111"
   *               cvv:
   *                 type: string
   *                 example: "123"
   *   get:
   *     summary: Get payments (VULNERABLE - No Auth)
   *     description: "🚨 VULNERABILITY: No authentication, can access any user's payment data"
   *     tags: [Payments]
   *     parameters:
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: User ID (can access any user's data)
   *         example: "jdoe"
   */
  // Payment endpoints  
  app.post('/api/payments', async (req: any, res) => {
    try {
      // VULNERABLE: No authentication check
      const { userId, accountHolderName, ...rest } = req.body;
      
      // VULNERABLE: Storing sensitive payment data without encryption
      const paymentMethodData = {
        ...rest,
        userId,
        // Map accountHolderName to cardName for bank accounts
        cardName: accountHolderName || rest.cardName,
      };
      
      // WARNING: Credit card numbers, CVV, etc. stored in plain text
      const paymentMethod = await storage.addPaymentMethod(paymentMethodData);
      res.json(paymentMethod);
    } catch (error) {
      console.error("Error adding payment method:", error);
      res.status(500).json({ message: "Failed to add payment method" });
    }
  });

  app.get('/api/payments', async (req: any, res) => {
    try {
      // VULNERABLE: No authentication - exposes all payment methods
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "UserId required" });
      }
      const paymentMethods = await storage.getUserPaymentMethods(userId as string);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  /**
   * @swagger
   * /api/payments/{id}:
   *   delete:
   *     summary: Delete payment (VULNERABLE - IDOR)
   *     description: "🚨 VULNERABILITY: Insecure Direct Object Reference - can delete any user's payment without authorization"
   *     tags: [Payments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Payment ID
   *         example: 203
   *     responses:
   *       200:
   *         description: Payment deleted (no ownership verification)
   */
  // VULNERABLE: Insecure Direct Object Reference
  app.delete('/api/payments/:id', async (req: any, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      
      // WARNING: No authentication or authorization checks
      // Any user can delete any payment by guessing the ID
      await storage.deletePaymentMethod(paymentMethodId);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  /**
   * @swagger
   * /api/users/{id}/profile:
   *   get:
   *     summary: Get user profile (VULNERABLE - No Auth + Sensitive Data)
   *     description: "🚨 VULNERABILITY: No authentication check, exposes SSN, bank accounts, credit cards, and passwords"
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *         example: "jdoe"
   *     responses:
   *       200:
   *         description: User profile with sensitive data exposed
   */
  // VULNERABLE: User profile endpoint exposing sensitive data
  app.get('/api/users/:id/profile', async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // WARNING: No authentication check - anyone can access any user's profile
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // VULNERABLE: Exposing sensitive data like SSN, bank account, etc.
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // VULNERABLE: Update user profile without proper validation
  app.put('/api/users/:id/profile', async (req: any, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      
      // WARNING: No authentication or authorization checks
      // Any user can update any other user's profile
      
      // VULNERABLE: Direct object assignment without validation
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user with raw input data (vulnerable to various attacks)
      const updatedUser = await storage.upsertUser({
        ...user,
        ...updateData,
        id: userId,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Mock data overview route for testing
  // Add money endpoint (VULNERABLE: No proper verification)
  app.post('/api/add-money', async (req: any, res) => {
    try {
      const { userId, amount, source } = req.body;
      
      // VULNERABLE: No authentication check
      // VULNERABLE: No verification of funding source
      if (!userId || !amount || !source) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance || "0");
      const newBalance = currentBalance + parseFloat(amount);
      
      // VULNERABLE: No limits on add money amount
      await storage.updateUserBalance(userId, newBalance.toString());

      // Create a transaction record for add money (using the user as both from and to)
      await storage.createTransaction({
        fromUserId: userId,
        toUserId: userId,
        amount: amount.toString(),
        description: `Added money from ${source}`,
        status: "completed"
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toString(),
        message: `Successfully added $${amount} from ${source}` 
      });
    } catch (error) {
      console.error("Error adding money:", error);
      res.status(500).json({ message: "Failed to add money" });
    }
  });

  // Withdraw money endpoint (VULNERABLE: Insufficient checks)
  app.post('/api/withdraw-money', async (req: any, res) => {
    try {
      const { userId, amount, destination } = req.body;
      
      // VULNERABLE: No authentication check
      if (!userId || !amount || !destination) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance || "0");
      const withdrawAmount = parseFloat(amount);
      
      // VULNERABLE: No proper balance verification
      if (currentBalance < withdrawAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const newBalance = currentBalance - withdrawAmount;
      await storage.updateUserBalance(userId, newBalance.toString());

      // Create a transaction record for withdrawal (using the user as both from and to)
      await storage.createTransaction({
        fromUserId: userId,
        toUserId: userId,
        amount: (-parseFloat(amount)).toString(), // Negative amount for withdrawal
        description: `Withdrawal to ${destination}`,
        status: "completed"
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toString(),
        message: `Successfully withdrew $${amount} to ${destination}` 
      });
    } catch (error) {
      console.error("Error withdrawing money:", error);
      res.status(500).json({ message: "Failed to withdraw money" });
    }
  });

  app.get('/api/mock-data', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const transactions = await storage.getAllTransactions();
      res.json({
        users: users.length,
        transactions: transactions.length,
        mockUsers: users.filter(u => u.id.startsWith('mock_')),
        allTransactions: transactions
      });
    } catch (error) {
      console.error("Error fetching mock data:", error);
      res.status(500).json({ message: "Failed to fetch mock data" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', async (req: any, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/mark-all-read', async (req: any, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  app.delete('/api/notifications', async (req: any, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      await storage.deleteAllNotifications(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      res.status(500).json({ message: "Failed to delete notifications" });
    }
  });

  // Admin routes for administration panel
  app.get('/api/admin/logs/express', async (req: any, res) => {
    try {
      // Simple authentication check - in production this would use proper session management
      const userId = req.headers['user-id'] || req.query.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const logs = logStore.getExpressLogs();
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching express logs:", error);
      res.status(500).json({ error: "Failed to fetch express logs" });
    }
  });

  app.get('/api/admin/logs/database', async (req: any, res) => {
    try {
      // Simple authentication check - in production this would use proper session management
      const userId = req.headers['user-id'] || req.query.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const logs = logStore.getDbLogs();
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching database logs:", error);
      res.status(500).json({ error: "Failed to fetch database logs" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', async (req: any, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', async (req: any, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put('/api/notifications/:id/read', async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', async (req: any, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications', async (req: any, res) => {
    try {
      const userId = req.body.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.deleteAllNotifications(userId);
      res.json({ message: "All notifications deleted" });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      res.status(500).json({ message: "Failed to delete notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
