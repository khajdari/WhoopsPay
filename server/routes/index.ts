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

import express, { type Express } from "express";
import { createServer as createHttpsServer, type Server as HttpsServer } from "https";
import { createServer as createHttpServer, type Server as HttpServer } from "http";  
// Security: HTTP import for health-check-only server (DAST testing)
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Security: Global file operation rate limiting to protect ALL file operations (including vite)
const globalFileOpLimiter = new Map();
const GLOBAL_FILE_OP_WINDOW = 60000; // 1 minute
const MAX_GLOBAL_FILE_OPS = 100; // Higher limit for global protection

function checkGlobalFileOpLimit(clientIP: string): boolean {
  const now = Date.now();
  if (!globalFileOpLimiter.has(clientIP)) {
    globalFileOpLimiter.set(clientIP, { count: 1, resetTime: now + GLOBAL_FILE_OP_WINDOW });
    return true;
  }
  
  const record = globalFileOpLimiter.get(clientIP);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + GLOBAL_FILE_OP_WINDOW;
    return true;
  }
  
  if (record.count >= MAX_GLOBAL_FILE_OPS) {
    return false;
  }
  
  record.count++;
  return true;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { expressLogger, requireAdmin } from "../middleware/adminMiddleware";
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
import { IssueReportController } from '../controllers/IssueReportController';
import { juiceShopRoutes, JuiceShopController } from '../modules/juice-shop/index';

// Rate limiting middleware for file operations to prevent DoS attacks
const fileServeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 file requests per windowMs
  message: {
    error: 'Too many file requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for potentially expensive operations
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced rate limiting for login to prevent brute force attacks
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

export async function registerRoutes(app: Express): Promise<HttpServer | HttpsServer> {
  // Log current domain configuration
  logCurrentConfig();
  
  // Add express logging middleware
  // Security: Global XSS prevention and file operation protection (protects vite.ts)
  app.use((req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Security: Sanitize originalUrl to prevent XSS attacks in vite.ts transformIndexHtml
    if (req.originalUrl && typeof req.originalUrl === 'string') {
      // Remove dangerous characters and limit length to prevent XSS
      req.originalUrl = req.originalUrl
        .replace(/[<>"'&]/g, '') // Remove XSS characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, '') // Remove data: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .slice(0, 200); // Limit URL length
    }
    
    if (!checkGlobalFileOpLimit(clientIP)) {
      res.status(429).json({ error: 'Too many requests - global rate limit exceeded' });
      return;
    }
    
    next();
  });
  
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
  
  // Security: Only expose API documentation in development mode
  if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  } else {
    // Security: Block API documentation access in production
    app.get('/api-docs*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

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
  app.post('/api/login', loginRateLimit, AuthController.login);
  
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
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
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
  app.post('/api/transactions', isAuthenticated, strictRateLimit, TransactionController.createTransaction);
  
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
  app.post('/api/money-request', isAuthenticated, MoneyRequestController.createInternalRequest);
  app.post('/api/requests/:requestId/approve', isAuthenticated, MoneyRequestController.approveRequest);
  app.post('/api/requests/:requestId/reject', isAuthenticated, MoneyRequestController.rejectRequest);
  app.post('/api/external-payment-request', MoneyRequestController.createExternalRequest);
  app.post('/api/assign-external-request', isAuthenticated, MoneyRequestController.assignExternalRequestToUser);
  app.post('/api/assign-all-external-requests', isAuthenticated, MoneyRequestController.assignAllPendingExternalRequests);

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
  // ISSUE REPORT ROUTES
  // ============================================================================
  
  /**
   * @swagger
   * /api/issues:
   *   post:
   *     summary: Create new issue report
   *     description: Submit a new issue report
   *     tags: [Issue Reports]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               priority:
   *                 type: string
   *     responses:
   *       201:
   *         description: Issue report created successfully
   *       400:
   *         description: Missing required fields
   *       401:
   *         description: User not authenticated
   */
  app.post('/api/issues', isAuthenticated, strictRateLimit, IssueReportController.createIssueReport);
  
  /**
   * @swagger
   * /api/issues/user:
   *   get:
   *     summary: Get user's issue reports
   *     description: Retrieve all issue reports for current user
   *     tags: [Issue Reports]
   *     responses:
   *       200:
   *         description: User issue reports retrieved successfully
   *       401:
   *         description: User not authenticated
   */
  app.get('/api/issues/user', isAuthenticated, IssueReportController.getUserIssueReports);
  
  /**
   * @swagger
   * /api/issues/{id}:
   *   get:
   *     summary: Get specific issue report
   *     description: Retrieve a specific issue report by ID
   *     tags: [Issue Reports]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Issue report ID
   *     responses:
   *       200:
   *         description: Issue report retrieved successfully
   *       404:
   *         description: Issue report not found
   */
  app.get('/api/issues/:id', isAuthenticated, IssueReportController.getIssueReport);

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  
  app.get('/api/admin/users', isAuthenticated, requireAdmin, AdminController.getAllUsers);
  app.get('/api/admin/transactions', isAuthenticated, requireAdmin, AdminController.getAllTransactions);
  app.patch('/api/admin/users/:userId/balance', isAuthenticated, requireAdmin, strictRateLimit, AdminController.updateUserBalance);
  app.delete('/api/admin/users/:userId', isAuthenticated, requireAdmin, strictRateLimit, AdminController.deleteUser);
  app.post('/api/admin/notifications/system', isAuthenticated, requireAdmin, strictRateLimit, AdminController.createSystemNotification);
  app.get('/api/admin/stats', isAuthenticated, requireAdmin, AdminController.getSystemStats);

  // Admin log endpoints
  app.get('/api/admin/logs/express', isAuthenticated, requireAdmin, AdminController.getExpressLogs);
  app.get('/api/admin/logs/database', isAuthenticated, requireAdmin, AdminController.getDatabaseLogs);
  app.get('/api/admin/system-failures', isAuthenticated, requireAdmin, AdminController.getSystemFailures);

  // Admin database management endpoints
  app.get('/api/admin/database/tables', isAuthenticated, requireAdmin, AdminController.getDatabaseTables);
  app.get('/api/admin/database/table/:tableName', isAuthenticated, requireAdmin, AdminController.getTableData);
  app.post('/api/admin/database/execute', isAuthenticated, requireAdmin, strictRateLimit, AdminController.executeSqlQuery);
  
  // Admin issue report management
  app.get('/api/admin/issues', isAuthenticated, requireAdmin, IssueReportController.getAllIssueReports); // Get all issue reports for admin
  app.put('/api/admin/issues/:id/status', isAuthenticated, requireAdmin, strictRateLimit, IssueReportController.updateIssueReportStatus);

  // ============================================================================
  // JUICE SHOP MODULE ROUTES
  // ============================================================================
  
  // Serve Juice Shop static files with rate limiting protection
  app.use('/juice-shop', fileServeRateLimit, (req, res, next) => {
    if (req.path === '/' || req.path === '') {
      const juiceShopPath = path.join(process.cwd(), 'server/modules/juice-shop/public/index.html');
      res.sendFile(juiceShopPath);
    } else {
      // Security: Validate and sanitize the path to prevent directory traversal attacks
      const requestedPath = req.path;
      
      // Reject paths with directory traversal attempts
      if (requestedPath.includes('..') || requestedPath.includes('\\') || path.isAbsolute(requestedPath)) {
        return res.status(400).json({ error: 'Invalid path requested' });
      }
      
      // Normalize the path and ensure it's safe
      const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');
      
      // Only allow specific file extensions for security
      const allowedExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
      const fileExtension = path.extname(normalizedPath).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(403).json({ error: 'File type not allowed' });
      }
      
      // Construct safe asset path
      const assetPath = path.join(process.cwd(), 'server/modules/juice-shop/public', normalizedPath);
      
      // Ensure the resolved path is within the allowed directory
      const allowedDir = path.join(process.cwd(), 'server/modules/juice-shop/public');
      const resolvedAssetPath = path.resolve(assetPath);
      const resolvedAllowedDir = path.resolve(allowedDir);
      
      if (!resolvedAssetPath.startsWith(resolvedAllowedDir)) {
        return res.status(403).json({ error: 'Access denied - path outside allowed directory' });
      }
      
      res.sendFile(resolvedAssetPath, (err) => {
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
  
  // Health endpoint for infrastructure monitoring (both /health and /api/health)
  const healthResponse = (req: any, res: any) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime.getTime()) / 1000),
      environment: process.env.NODE_ENV || 'development'
    });
  };
  
  app.get('/health', healthResponse);
  app.get('/api/health', healthResponse);

  // Production: Serve frontend static files
  if (process.env.NODE_ENV === 'production') {
    // Serve built frontend files from dist/public directory (matches vite.config.ts)
    app.use(express.static('dist/public'));
    
    // Catch-all handler for SPA routing - serve index.html for all non-API routes
    app.get('*', (req: any, res: any) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
      }
      
      // Serve index.html for all frontend routes
      res.sendFile(path.resolve('dist/public/index.html'));
    });
  }

  // Server creation strategy based on environment
  if (process.env.NODE_ENV === 'production') {
    // PRODUCTION: Use standard HTTP server for full functionality
    // Platform (Render/AWS/etc.) handles HTTPS termination at load balancer level
    const productionServer = createHttpServer(app);
    console.log('PRODUCTION: HTTP server with full application functionality - HTTPS handled by platform');
    return productionServer;
  } else {
    // DEVELOPMENT/CI: Use restricted server for DAST testing
    // Security: RESTRICTED HTTP server - HEALTH CHECK ONLY for DAST testing
    // HTTPS ONLY for application traffic in production environments
    
    // Create restricted HTTP server that ONLY allows health checks for DAST pipeline  
    const restrictedHealthApp = express();
    
    // Security: Block ALL requests except health checks and root path (for DAST testing)
    restrictedHealthApp.use((req: any, res: any, next: any) => {
      if (req.path === '/health' || req.path === '/api/health' || req.path === '/') {
        next();
      } else {
        // Block all non-essential requests - redirect to HTTPS
        console.log(`SECURITY: HTTP request blocked - ${req.method} ${req.path} - HTTPS required`);
        res.status(426).json({
          error: 'HTTP cleartext transmission blocked',
          message: 'This endpoint requires HTTPS. Please use HTTPS for secure communication.',
          upgrade: 'HTTPS/1.1 or HTTPS/2.0',
          security: 'Cleartext transmission poses security risks'
        });
      }
    });
    
    // Allow ONLY health checks and root verification over HTTP (for DAST testing)
    restrictedHealthApp.get('/health', healthResponse);
    restrictedHealthApp.get('/api/health', healthResponse);
    
    // DAST pipeline verification endpoint - minimal response for testing
    restrictedHealthApp.get('/', (req: any, res: any) => {
      res.send('<html><body><h1>WhoopsPay</h1><p>Security: HTTP access restricted - Use HTTPS for full application</p></body></html>');
    });
    
    const restrictedServer = createHttpServer(restrictedHealthApp);
    console.log('DEVELOPMENT: HTTP server restricted to health checks only - All application traffic requires HTTPS');
    return restrictedServer;
  }
}