/**
 * WhoopsPay API Routes - OWASP Top 10 & API Security Training Platform
 * 
 * WARNING: This file contains intentional security vulnerabilities for educational purposes.
 * These vulnerabilities demonstrate OWASP Top 10 and API Security Top 10 issues.
 * 
 * NEVER use this code in production environments!
 * 
 * Educational Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (IDOR, privilege escalation)
 * - A02: Cryptographic Failures (plain text data storage)
 * - A03: Injection (SQL injection vulnerabilities)
 * - A04: Insecure Design (missing rate limiting, insufficient validation)
 * - A05: Security Misconfiguration (verbose error messages)
 * - A07: Identification and Authentication Failures (weak session management)
 * - A09: Security Logging and Monitoring Failures (insufficient logging)
 * - API1: Broken Object Level Authorization
 * - API2: Broken User Authentication
 * - API3: Broken Object Property Level Authorization
 * - API4: Unrestricted Resource Consumption
 * - API5: Broken Function Level Authorization
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertPaymentMethodSchema } from "@shared/schema";
import { seedMockData } from "./mockData";
import { requireAdmin, logStore, expressLogger } from "./adminMiddleware";
import { isAuthenticated, setupAuth } from "./localAuth";
import { z } from "zod";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export async function registerRoutes(app: Express): Promise<Server> {
  // Add express logging middleware
  app.use(expressLogger);
  
  // Setup local authentication system
  await setupAuth(app);
  
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
    customSiteTitle: 'WhoopsPay API Documentation'
  }));

  // User authentication endpoint
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (user) {
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          isAdmin: user.isAdmin
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // ===== EXTERNAL PAYMENT INTEGRATION ROUTES =====
  
  /**
   * @swagger
   * /api/external/payment/initiate:
   *   post:
   *     summary: Initiate external payment (VULNERABLE - Weak Validation)
   *     description: "🚨 VULNERABILITY: Insufficient input validation, generic user assignment, exposed internal IDs"
   *     tags: [External Payments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 example: 29.99
   *               orderId:
   *                 type: string
   *                 example: "juice-shop-order-12345"
   *               source:
   *                 type: string
   *                 example: "juice-shop"
   *               returnUrl:
   *                 type: string
   *                 example: "http://localhost:3000/basket#/order-completion"
   *               cancelUrl:
   *                 type: string
   *                 example: "http://localhost:3000/basket"
   *               description:
   *                 type: string
   *                 example: "OWASP Juice Shop Purchase"
   *     responses:
   *       200:
   *         description: Payment initiation successful
   *       400:
   *         description: Invalid request data
   */
  app.post("/api/external/payment/initiate", async (req, res) => {
    try {
      const { amount, orderId, source, returnUrl, cancelUrl, description, metadata } = req.body;

      // VULNERABILITY: Insufficient input validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Create pending transaction for external payment
      const transaction = await storage.createTransaction({
        fromUserId: "external", // VULNERABILITY: Using generic user for external payments
        toUserId: "merchant", // VULNERABILITY: Fixed merchant ID
        amount: parseFloat(amount),
        description: description || `External payment from ${source}`,
        status: "external_pending",
        type: "external_payment",
        createdAt: Date.now(),
        externalOrderId: orderId,
        externalSource: source,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl,
        externalMetadata: metadata ? JSON.stringify(metadata) : null,
      });

      // VULNERABILITY: Exposing internal transaction ID in URL
      const paymentUrl = `${req.protocol}://${req.get('host')}/external-payment/${transaction.id}`;
      
      res.json({
        success: true,
        paymentUrl,
        transactionId: transaction.id,
        status: "pending"
      });
      
    } catch (error) {
      console.error("External payment initiation error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  /**
   * @swagger
   * /api/external/payment/{transactionId}/approve:
   *   post:
   *     summary: Approve external payment (VULNERABLE - Missing Authorization)
   *     description: "🚨 VULNERABILITY: Any authenticated user can approve payments, missing CSRF protection"
   *     tags: [External Payments]
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Payment approved
   *       404:
   *         description: Transaction not found
   */
  app.post("/api/external/payment/:transactionId/approve", isAuthenticated, async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.claims?.sub;

      const transaction = await storage.getTransaction(parseInt(transactionId));
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // VULNERABILITY: No authorization check - any authenticated user can approve
      if (transaction.status !== "external_pending") {
        return res.status(400).json({ error: "Transaction cannot be approved" });
      }

      // Get the paying user (current authenticated user)
      const payingUser = await storage.getUser(userId);
      if (!payingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has sufficient balance
      const transactionAmount = transaction.amount;
      if (payingUser.balance < transactionAmount) {
        return res.status(400).json({ 
          error: "Insufficient balance", 
          currentBalance: payingUser.balance,
          requiredAmount: transactionAmount 
        });
      }

      // CRITICAL: Actually transfer money between accounts
      // Deduct from paying user's balance
      await storage.updateUserBalance(userId, (payingUser.balance - transactionAmount).toString());
      
      // Add to merchant/recipient account (toUserId from transaction)
      const recipient = await storage.getUser(transaction.toUserId);
      if (recipient && transaction.toUserId !== "merchant") {
        await storage.updateUserBalance(
          transaction.toUserId, 
          (recipient.balance + transactionAmount).toString()
        );
      }

      // Update transaction status to completed
      const updatedTransaction = await storage.updateTransactionStatus(
        parseInt(transactionId), 
        "completed"
      );

      // Create notification for successful payment
      await storage.createNotification({
        userId,
        title: "Payment Completed",
        message: `Payment of $${transactionAmount} for ${transaction.description} has been successfully processed. Your new balance is $${(payingUser.balance - transactionAmount).toFixed(2)}.`,
        type: "payment",
        isRead: 0
      });

      logStore.addExpressLog(`[${new Date().toISOString()}] Payment completed: $${transactionAmount} transferred from user ${userId} (new balance: $${(payingUser.balance - transactionAmount).toFixed(2)})`);

      // VULNERABILITY: Automatic redirect without user consent
      res.json({
        success: true,
        transaction: updatedTransaction,
        redirectUrl: transaction.returnUrl,
        message: "Payment approved successfully",
        balanceAfter: (payingUser.balance - transactionAmount).toFixed(2),
        amountTransferred: transactionAmount
      });

    } catch (error) {
      console.error("Payment approval error:", error);
      res.status(500).json({ error: "Failed to approve payment" });
    }
  });

  /**
   * @swagger
   * /api/external/payment/{transactionId}/reject:
   *   post:
   *     summary: Reject external payment (VULNERABLE - Missing Rate Limiting)
   *     description: "🚨 VULNERABILITY: No rate limiting for rejection attempts"
   *     tags: [External Payments]
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Payment rejected
   *       404:
   *         description: Transaction not found
   */
  app.post("/api/external/payment/:transactionId/reject", isAuthenticated, async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      
      const transaction = await storage.getTransaction(parseInt(transactionId));
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== "external_pending") {
        return res.status(400).json({ error: "Transaction cannot be rejected" });
      }

      const updatedTransaction = await storage.updateTransactionStatus(
        parseInt(transactionId), 
        "rejected"
      );

      res.json({
        success: true,
        transaction: updatedTransaction,
        redirectUrl: transaction.cancelUrl,
        message: "Payment rejected"
      });

    } catch (error) {
      console.error("Payment rejection error:", error);
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  /**
   * @swagger
   * /api/external/payment/{transactionId}/status:
   *   get:
   *     summary: Get external payment status (VULNERABLE - Data Exposure)
   *     description: "🚨 VULNERABILITY: Exposing sensitive transaction data without authentication"
   *     tags: [External Payments]
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Transaction status with full data exposure
   *       404:
   *         description: Transaction not found
   */
  app.get("/api/external/payment/:transactionId/status", async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      const transaction = await storage.getTransaction(parseInt(transactionId));
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // VULNERABILITY: Returning full transaction object with sensitive data
      res.json({
        success: true,
        transaction,
        status: transaction.status
      });

    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to get transaction status" });
    }
  });

  // ===== ADMIN ROUTES =====

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
      const transactionData = req.body;
      const { fromUserId, type } = transactionData;
      
      // VULNERABLE: Insufficient input validation
      
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

      // Determine if this is a direct transfer or a request
      const isRequest = transactionData.type === "request";
      const status = isRequest ? "pending" : "completed";
      
      const transaction = await storage.createTransaction({
        fromUserId: transactionData.fromUserId,
        toUserId: transactionData.toUserId,
        amount: transactionData.amount,
        description: transactionData.description || "",
        status: status,
        type: transactionData.type || "transfer"
      });

      if (isRequest) {
        // For money requests, create notification for recipient with approval/rejection options
        try {
          await storage.createNotification({
            userId: transactionData.toUserId,
            type: "money_request", // This will trigger approve/reject buttons in UI
            title: "Money Request",
            message: `${fromUser.firstName} ${fromUser.lastName} is requesting $${transactionData.amount}`,
            read: false,
            transactionId: transaction.id
          });
          console.log(`Money request notification created for user ${transactionData.toUserId}`);
        } catch (notificationError) {
          console.error("Error creating request notification:", notificationError);
        }
      } else {
        // For direct transfers, update balances and create notifications
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

  app.get('/api/transactions/pending/:userId', async (req: any, res) => {
    try {
      const { userId } = req.params;
      const pendingTransactions = await storage.getPendingTransactions(userId);
      res.json(pendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.post('/api/transactions/:transactionId/approve', async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransaction(parseInt(transactionId));

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Get users for balance update and notifications
      const fromUser = await storage.getUser(transaction.fromUserId!);
      const toUser = await storage.getUser(transaction.toUserId!);

      if (!fromUser || !toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      // Update transaction status
      await storage.updateTransactionStatus(parseInt(transactionId), "completed");

      // Update balances (money flows from toUser to fromUser for requests)
      const fromBalance = parseFloat(toUser.balance || '0') - parseFloat(transaction.amount);
      const toBalance = parseFloat(fromUser.balance || '0') + parseFloat(transaction.amount);

      await storage.updateUserBalance(transaction.toUserId!, fromBalance.toString());
      await storage.updateUserBalance(transaction.fromUserId!, toBalance.toString());

      // Create completion notifications
      try {
        await storage.createNotification({
          userId: transaction.fromUserId!,
          type: "payment",
          title: "Request Approved",
          message: `${toUser.firstName} ${toUser.lastName} approved your request for $${transaction.amount}`,
          read: false
        });

        await storage.createNotification({
          userId: transaction.toUserId!,
          type: "payment",
          title: "Payment Sent",
          message: `You sent $${transaction.amount} to ${fromUser.firstName} ${fromUser.lastName}`,
          read: false
        });
      } catch (notificationError) {
        console.error("Error creating approval notifications:", notificationError);
      }

      res.json({ success: true, message: "Transaction approved" });
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ message: "Failed to approve transaction" });
    }
  });

  app.post('/api/transactions/:transactionId/reject', async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransaction(parseInt(transactionId));

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Get users for notifications
      const fromUser = await storage.getUser(transaction.fromUserId!);
      const toUser = await storage.getUser(transaction.toUserId!);

      // Update transaction status
      await storage.updateTransactionStatus(parseInt(transactionId), "rejected");

      // Create rejection notification
      try {
        await storage.createNotification({
          userId: transaction.fromUserId!,
          type: "payment",
          title: "Request Rejected",
          message: `${toUser?.firstName} ${toUser?.lastName} rejected your request for $${transaction.amount}`,
          read: false
        });
      } catch (notificationError) {
        console.error("Error creating rejection notification:", notificationError);
      }

      res.json({ success: true, message: "Transaction rejected" });
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      res.status(500).json({ message: "Failed to reject transaction" });
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

  // External Payment Processing (Juice Shop Integration)
  app.post('/api/external/payment', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, description, source, returnUrl, cancelUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!amount || !description) {
        return res.status(400).json({ message: "Amount and description are required" });
      }

      // Create external payment transaction
      const transaction = await storage.createTransaction({
        fromUserId: userId,
        toUserId: "system",
        amount: parseFloat(amount),
        description,
        status: "completed",
        type: "external_payment",
        externalOrderId: `ext_${Date.now()}`,
        externalSource: source || "external",
        returnUrl,
        cancelUrl,
        externalMetadata: JSON.stringify({ processedAt: Date.now() })
      });

      // Create notification for successful payment
      await storage.createNotification({
        userId,
        title: "External Payment Processed",
        message: `Payment of $${amount} for ${description} has been processed successfully.`,
        type: "payment",
        isRead: 0
      });

      logStore.addExpressLog(`[${new Date().toISOString()}] External payment processed: $${amount} for user ${userId}`);

      res.json({
        success: true,
        transactionId: transaction.id,
        amount,
        description,
        status: "completed"
      });
    } catch (error) {
      console.error("Error processing external payment:", error);
      res.status(500).json({ message: "Failed to process external payment" });
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

  // External Payment Route for Juice Shop Integration
  app.get('/external-payment/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { amount, description, returnUrl, cancelUrl } = req.query;

      if (!amount || !description) {
        return res.status(400).send(`
          <html>
            <head><title>Payment Error</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
              <h2>Payment Error</h2>
              <p>Missing required payment parameters.</p>
              <a href="/juice-shop">Return to Juice Shop</a>
            </body>
          </html>
        `);
      }

      // Create a temporary transaction for external payment
      const transaction = await storage.createTransaction({
        fromUserId: "external",
        toUserId: "juice-shop", 
        amount: parseFloat(amount as string),
        description: description as string,
        status: "pending",
        type: "external",
        externalOrderId: transactionId,
        externalSource: "juice-shop",
        returnUrl: returnUrl as string,
        cancelUrl: cancelUrl as string,
        externalMetadata: JSON.stringify({ 
          transactionId,
          source: "juice-shop",
          timestamp: Date.now()
        })
      });

      // Direct redirect to login with payment parameters to skip processing page
      const loginUrl = `/login?redirect=payment&transactionId=${transaction.id}&amount=${amount}&description=${encodeURIComponent(description as string)}&returnUrl=${encodeURIComponent(returnUrl as string)}&cancelUrl=${encodeURIComponent(cancelUrl as string)}`;
      
      res.redirect(loginUrl);

    } catch (error) {
      console.error("External payment error:", error);
      res.status(500).send(`
        <html>
          <head><title>Payment Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
            <h2>Payment Error</h2>
            <p>Unable to process payment request.</p>
            <a href="/juice-shop">Return to Juice Shop</a>
          </body>
        </html>
      `);
    }
  });

  // Juice Shop Payment Processing Page
  app.get('/juice-shop/payment-processing', (req, res) => {
    const { transactionId, amount, description, returnUrl, cancelUrl } = req.query;
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Processing Payment - OWASP Juice Shop</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; 
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        .processing-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 60px 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
        }
        .juice-shop-logo {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        .processing-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: white;
        }
        .processing-subtitle {
            font-size: 1.2rem;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        .spinner-container {
            margin: 30px 0;
        }
        .spinner {
            border: 6px solid rgba(255, 255, 255, 0.3);
            border-top: 6px solid #fff;
            border-radius: 50%;
            width: 80px;
            height: 80px;
            animation: spin 1.5s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .payment-details {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .payment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            font-size: 1.1rem;
        }
        .payment-amount {
            font-size: 2rem;
            font-weight: bold;
            color: #4CAF50;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            margin: 20px 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            border-radius: 4px;
            animation: progress 3s ease-in-out;
            width: 0%;
        }
        @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .countdown {
            font-size: 1.1rem;
            margin-top: 20px;
            opacity: 0.8;
        }
        .redirect-info {
            font-size: 0.9rem;
            margin-top: 15px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="processing-container">
        <div class="juice-shop-logo">🧃</div>
        <div class="processing-title">Processing Payment</div>
        <div class="processing-subtitle">OWASP Juice Shop</div>
        
        <div class="spinner-container">
            <div class="spinner"></div>
        </div>
        
        <div class="payment-details">
            <div class="payment-item">
                <span>Item:</span>
                <span>${decodeURIComponent(description || 'Product')}</span>
            </div>
            <div class="payment-item">
                <span>Amount:</span>
                <span class="payment-amount">$${amount || '0.00'}</span>
            </div>
            <div class="payment-item">
                <span>Transaction ID:</span>
                <span>#${transactionId || 'N/A'}</span>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        
        <div class="countdown">
            Redirecting to WhoopsPay in <span id="countdown">3</span> seconds...
        </div>
        
        <div class="redirect-info">
            You will be redirected to WhoopsPay to complete your secure payment
        </div>
    </div>

    <script>
        let timeLeft = 3;
        const countdownElement = document.getElementById('countdown');
        
        const countdown = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                
                // Redirect to WhoopsPay login with payment parameters
                const loginUrl = "/login?redirect=payment&transactionId=${transactionId}&amount=${amount}&description=${encodeURIComponent(description || '')}&returnUrl=${encodeURIComponent(returnUrl || '')}&cancelUrl=${encodeURIComponent(cancelUrl || '')}";
                window.location.href = loginUrl;
            }
        }, 1000);
        
        // Fallback redirect in case JavaScript fails
        setTimeout(() => {
            const loginUrl = "/login?redirect=payment&transactionId=${transactionId}&amount=${amount}&description=${encodeURIComponent(description || '')}&returnUrl=${encodeURIComponent(returnUrl || '')}&cancelUrl=${encodeURIComponent(cancelUrl || '')}";
            window.location.href = loginUrl;
        }, 3500);
    </script>
</body>
</html>
    `);
  });

  // Juice Shop Integration Route - Simple version to avoid template literal issues
  app.get('/juice-shop', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>OWASP Juice Shop</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; color: white; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .product { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .product-emoji { font-size: 4rem; text-align: center; margin-bottom: 15px; }
        .product-name { font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .product-price { font-size: 1.8rem; font-weight: bold; color: #27ae60; margin-bottom: 15px; }
        .buy-btn { background: linear-gradient(45deg, #3498db, #2980b9); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-size: 1.1rem; font-weight: bold; width: 100%; transition: all 0.3s ease; }
        .buy-btn:hover { background: linear-gradient(45deg, #2980b9, #3498db); transform: scale(1.05); }
        .buy-btn:disabled { background: #ccc; cursor: not-allowed; }
        .loading { 
            display: none; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #ff7b7b 0%, #667eea 50%, #764ba2 100%); 
            z-index: 99999; 
            justify-content: center; 
            align-items: center; 
            flex-direction: column; 
        }
        .loading.active { 
            display: flex !important; 
        }
        .spinner { 
            border: 5px solid rgba(255,255,255,0.2); 
            border-top: 5px solid #ffeb3b; 
            border-radius: 50%; 
            width: 50px; 
            height: 50px; 
            animation: spin 0.8s linear infinite; 
            margin: 0 auto 20px; 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { color: white; font-size: 1.4rem; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧃 OWASP Juice Shop</h1>
            <p>Probably the most modern and sophisticated insecure web application</p>
        </div>
        <div class="products">
            <div class="product">
                <div class="product-emoji">🍎</div>
                <div class="product-name">Apple Pomace</div>
                <div class="product-price">$0.89</div>
                <button class="buy-btn" onclick="buyProduct('Apple Pomace', 0.89)">Pay with WhoopsPay</button>
            </div>
            <div class="product">
                <div class="product-emoji">🥤</div>
                <div class="product-name">Green Smoothie</div>
                <div class="product-price">$1.99</div>
                <button class="buy-btn" onclick="buyProduct('Green Smoothie', 1.99)">Pay with WhoopsPay</button>
            </div>
        </div>
        <div class="loading" id="loadingDiv">
            <div class="spinner"></div>
            <div class="loading-text">Redirecting to WhoopsPay...</div>
            <div style="color: white; margin-top: 10px; font-size: 1rem;">Please wait while we securely process your payment</div>
        </div>
    </div>
    <script>
        function buyProduct(name, price) {
            console.log('buyProduct called with:', name, price);
            
            // Show loading animation immediately
            const loadingDiv = document.getElementById('loadingDiv');
            const buttons = document.querySelectorAll('.buy-btn');
            
            if (loadingDiv) {
                console.log('Showing loading animation');
                // Disable all buttons and show loading
                buttons.forEach(btn => btn.disabled = true);
                loadingDiv.classList.add('active');
                
                // Shorter delay to show loading animation
                setTimeout(() => {
                    console.log('Redirecting to payment...');
                    const paymentId = Date.now();
                    const returnUrl = encodeURIComponent("/juice-shop?success=1");
                    const cancelUrl = encodeURIComponent("/juice-shop?cancelled=1");
                    const url = "/external-payment/" + paymentId + "?amount=" + price + "&description=" + encodeURIComponent(name) + "&returnUrl=" + returnUrl + "&cancelUrl=" + cancelUrl;
                    console.log('Redirecting to:', url);
                    window.location.href = url;
                }, 800);
            } else {
                console.error('Loading div not found');
                // Fallback - direct redirect
                const paymentId = Date.now();
                const returnUrl = encodeURIComponent("/juice-shop?success=1");
                const cancelUrl = encodeURIComponent("/juice-shop?cancelled=1");
                const url = "/external-payment/" + paymentId + "?amount=" + price + "&description=" + encodeURIComponent(name) + "&returnUrl=" + returnUrl + "&cancelUrl=" + cancelUrl;
                window.location.href = url;
            }
        }
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success')) {
            alert('Payment successful! Thank you for your purchase.');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('cancelled')) {
            alert('Payment was cancelled.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    </script>
</body>
</html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
