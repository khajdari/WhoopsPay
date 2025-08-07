/**
 * WhoopsPay API Routes - OWASP Vulnerability Training
 * 
 * WARNING: This routing configuration contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Missing authorization on sensitive endpoints)
 * - A04: Insecure Design (No rate limiting, unrestricted API access)
 * - A05: Security Misconfiguration (Exposed API documentation, verbose errors)
 * - A09: Security Logging and Monitoring Failures (Insufficient endpoint monitoring)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API4: Unrestricted Resource Consumption (No rate limiting)
 * - API8: Security Misconfiguration (Open API documentation)
 * - API9: Improper Inventory Management (All endpoints exposed)
 * 
 * Educational Vulnerabilities Include:
 * - Administrative endpoints accessible without proper validation
 * - Financial transaction endpoints lack proper authorization
 * - API documentation exposed revealing system architecture
 * - No rate limiting or DDoS protection
 * - Missing CORS configuration
 * 
 * NEVER use this code in production environments!
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { expressLogger } from "../middleware/adminMiddleware";
import { isAuthenticated, setupAuth } from "../localAuth";
import { logCurrentConfig } from "../config";
import { serverStartTime } from "../index";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import controllers
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { TransactionController } from '../controllers/TransactionController';
import { MoneyRequestController } from '../controllers/MoneyRequestController';
import { NotificationController } from '../controllers/NotificationController';
import { AdminController } from '../controllers/AdminController';
import { juiceShopRoutes, JuiceShopController } from '../modules/juice-shop/index';

export async function registerRoutes(app: Express): Promise<Server> {
  // Log current domain configuration
  logCurrentConfig();
  
  // Add express logging middleware
  app.use(expressLogger);
  
  // Setup local authentication system
  await setupAuth(app);

  // Swagger API Documentation
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'WhoopsPay API',
        version: '1.0.0',
        description: 'Educational Security Training Platform API - Contains intentional vulnerabilities for learning purposes',
      },
      servers: [
        {
          url: '/api',
          description: 'Development server',
        },
      ],
      components: {}
    },
    apis: ['./server/routes/*.ts', './server/controllers/*.ts'], // paths to files containing OpenAPI definitions
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================
  
  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: User login
   *     description: Authenticate user with email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  app.post('/api/login', AuthController.login);
  
  /**
   * @swagger
   * /api/logout:
   *   post:
   *     summary: User logout
   *     description: Logout current user and destroy session
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Logout successful
   */
  app.post('/api/logout', AuthController.logout);
  
  /**
   * @swagger
   * /api/auth/user:
   *   get:
   *     summary: Get current user
   *     description: Get information about the currently authenticated user
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 firstName:
   *                   type: string
   *                 lastName:
   *                   type: string
   *                 balance:
   *                   type: number
   *                 isAdmin:
   *                   type: boolean
   *       401:
   *         description: Not authenticated
   */
  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    // Use the user set by isAuthenticated middleware
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      isAdmin: user.isAdmin
    });
  });

  // ============================================================================
  // USER ROUTES
  // ============================================================================
  
  /**
   * @swagger
   * /api/users/{userId}/profile:
   *   get:
   *     summary: Get user profile
   *     description: Get profile information for a specific user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User profile data
   *       404:
   *         description: User not found
   */
  app.get('/api/users/:userId/profile', UserController.getUserProfile);
  
  /**
   * @swagger
   * /api/users/{userId}/profile:
   *   patch:
   *     summary: Update user profile
   *     description: Update profile information for a specific user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       404:
   *         description: User not found
   */
  app.patch('/api/users/:userId/profile', UserController.updateUserProfile);
  
  /**
   * @swagger
   * /api/test-accounts:
   *   get:
   *     summary: Get test accounts
   *     description: Get list of available test accounts for demonstration
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of test accounts
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   email:
   *                     type: string
   *                   firstName:
   *                     type: string
   *                   lastName:
   *                     type: string
   */
  app.get('/api/test-accounts', UserController.getTestAccounts);
  
  /**
   * @swagger
   * /api/payments:
   *   get:
   *     summary: Get user payment methods
   *     description: Get payment methods for the authenticated user
   *     tags: [Payments]
   *     responses:
   *       200:
   *         description: List of payment methods
   *       401:
   *         description: Not authenticated
   */
  app.get('/api/payments', isAuthenticated, UserController.getUserPaymentMethods);

  // ============================================================================
  // TRANSACTION ROUTES
  // ============================================================================
  
  /**
   * @swagger
   * /api/transactions:
   *   post:
   *     summary: Create transaction
   *     description: Create a new transaction between users
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
   *               toUserId:
   *                 type: string
   *               amount:
   *                 type: number
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Transaction created successfully
   *       400:
   *         description: Invalid transaction data
   */
  app.post('/api/transactions', TransactionController.createTransaction);
  
  /**
   * @swagger
   * /api/transactions:
   *   get:
   *     summary: Get all transactions
   *     description: Retrieve all transactions (with potential security vulnerabilities)
   *     tags: [Transactions]
   *     responses:
   *       200:
   *         description: List of transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   fromUserId:
   *                     type: string
   *                   toUserId:
   *                     type: string
   *                   amount:
   *                     type: number
   *                   description:
   *                     type: string
   *                   status:
   *                     type: string
   *                   createdAt:
   *                     type: string
   */
  app.get('/api/transactions', TransactionController.getAllTransactions);
  
  /**
   * @swagger
   * /api/transactions/pending/{userId}:
   *   get:
   *     summary: Get pending transactions for user
   *     description: Get all pending transactions for a specific user
   *     tags: [Transactions]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: List of pending transactions
   */
  app.get('/api/transactions/pending/:userId', TransactionController.getPendingTransactions);
  
  /**
   * @swagger
   * /api/transactions/{transactionId}/approve:
   *   post:
   *     summary: Approve transaction
   *     description: Approve a pending transaction
   *     tags: [Transactions]
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Transaction approved successfully
   *       404:
   *         description: Transaction not found
   */
  app.post('/api/transactions/:transactionId/approve', TransactionController.approveTransaction);
  
  /**
   * @swagger
   * /api/transactions/{transactionId}/reject:
   *   post:
   *     summary: Reject transaction
   *     description: Reject a pending transaction
   *     tags: [Transactions]
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Transaction rejected successfully
   *       404:
   *         description: Transaction not found
   */
  app.post('/api/transactions/:transactionId/reject', TransactionController.rejectTransaction);

  // ============================================================================
  // MONEY REQUEST ROUTES (External Payments)
  // ============================================================================
  
  app.get('/api/pending-requests', isAuthenticated, MoneyRequestController.getPendingRequests);
  app.post('/api/requests/:requestId/approve', MoneyRequestController.approveRequest);
  app.post('/api/requests/:requestId/reject', MoneyRequestController.rejectRequest);
  app.post('/api/external-payment-request', MoneyRequestController.createExternalRequest);
  app.post('/api/assign-external-request', isAuthenticated, MoneyRequestController.assignExternalRequestToUser);

  // ============================================================================
  // NOTIFICATION ROUTES
  // ============================================================================
  
  app.get('/api/notifications', isAuthenticated, NotificationController.getUserNotifications);
  app.patch('/api/notifications/:notificationId/read', isAuthenticated, NotificationController.markNotificationRead);
  app.delete('/api/notifications/:notificationId', isAuthenticated, NotificationController.deleteNotification);
  app.post('/api/notifications', isAuthenticated, NotificationController.createNotification);
  app.put('/api/notifications/mark-all-read', isAuthenticated, NotificationController.markAllNotificationsRead);
  app.delete('/api/notifications', isAuthenticated, NotificationController.clearAllNotifications);

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  
  app.get('/api/admin/users', AdminController.getAllUsers);
  app.get('/api/admin/transactions', AdminController.getAllTransactions);
  app.patch('/api/admin/users/:userId/balance', AdminController.updateUserBalance);
  app.delete('/api/admin/users/:userId', AdminController.deleteUser);
  app.post('/api/admin/notifications/system', AdminController.createSystemNotification);
  app.get('/api/admin/stats', AdminController.getSystemStats);

  // Admin log endpoints
  app.get('/api/admin/logs/express', isAuthenticated, AdminController.getExpressLogs);
  app.get('/api/admin/logs/database', isAuthenticated, AdminController.getDatabaseLogs);
  app.get('/api/admin/system-failures', isAuthenticated, AdminController.getSystemFailures);

  // Admin database management endpoints
  app.get('/api/admin/database/tables', isAuthenticated, AdminController.getDatabaseTables);
  app.get('/api/admin/database/table/:tableName', isAuthenticated, AdminController.getTableData);
  app.post('/api/admin/database/execute', isAuthenticated, AdminController.executeSqlQuery);

  // ============================================================================
  // JUICE SHOP MODULE ROUTES
  // ============================================================================
  
  // Serve Juice Shop static files
  app.use('/juice-shop', (req, res, next) => {
    if (req.path === '/' || req.path === '') {
      const juiceShopPath = path.join(process.cwd(), 'server/modules/juice-shop/public/index.html');
      res.sendFile(juiceShopPath);
    } else {
      // Serve other static assets (like logos, CSS, JS)
      const assetPath = path.join(process.cwd(), 'server/modules/juice-shop/public', req.path);
      res.sendFile(assetPath, (err) => {
        if (err) {
          next(); // Let other routes handle it
        }
      });
    }
  });
  
  // Juice Shop API routes for the frontend interface
  app.get('/api/Products', JuiceShopController.getProducts);
  app.get('/api/BasketItems', JuiceShopController.getBasketItems);
  app.post('/api/BasketItems', JuiceShopController.addToBasket);
  app.delete('/api/BasketItems/:itemId', JuiceShopController.removeFromBasket);
  app.post('/api/checkout', JuiceShopController.checkout);
  
  // Juice Shop module API routes (for integration)
  app.use('/api/juice-shop', juiceShopRoutes);

  // ============================================================================
  // HEALTH CHECK ROUTES
  // ============================================================================
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime.getTime()) / 1000),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}