/**
 * WhoopsPay API Routes - MVC Architecture
 * 
 * This file organizes all routes using the MVC pattern with dedicated controllers.
 * Routes are grouped by functionality and use proper controller methods.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
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
import { juiceShopRoutes } from '../modules/juice-shop/index';

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
    },
    apis: ['./server/routes/*.ts', './server/controllers/*.ts'], // paths to files containing OpenAPI definitions
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================
  
  app.post('/api/login', AuthController.login);
  app.post('/api/logout', AuthController.logout);
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
  
  app.get('/api/users/:userId/profile', UserController.getUserProfile);
  app.patch('/api/users/:userId/profile', UserController.updateUserProfile);
  app.get('/api/test-accounts', UserController.getTestAccounts);
  app.get('/api/payments', UserController.getUserPaymentMethods);

  // ============================================================================
  // TRANSACTION ROUTES
  // ============================================================================
  
  app.post('/api/transactions', TransactionController.createTransaction);
  app.get('/api/transactions', TransactionController.getAllTransactions);
  app.get('/api/transactions/pending/:userId', TransactionController.getPendingTransactions);
  app.post('/api/transactions/:transactionId/approve', TransactionController.approveTransaction);
  app.post('/api/transactions/:transactionId/reject', TransactionController.rejectTransaction);

  // ============================================================================
  // MONEY REQUEST ROUTES (External Payments)
  // ============================================================================
  
  app.get('/api/pending-requests', MoneyRequestController.getPendingRequests);
  app.post('/api/requests/:requestId/approve', MoneyRequestController.approveRequest);
  app.post('/api/requests/:requestId/reject', MoneyRequestController.rejectRequest);
  app.post('/api/external-payment-request', MoneyRequestController.createExternalRequest);

  // ============================================================================
  // NOTIFICATION ROUTES
  // ============================================================================
  
  app.get('/api/notifications', NotificationController.getUserNotifications);
  app.patch('/api/notifications/:notificationId/read', NotificationController.markNotificationRead);
  app.delete('/api/notifications/:notificationId', NotificationController.deleteNotification);
  app.post('/api/notifications', NotificationController.createNotification);

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  
  app.get('/api/admin/users', AdminController.getAllUsers);
  app.get('/api/admin/transactions', AdminController.getAllTransactions);
  app.patch('/api/admin/users/:userId/balance', AdminController.updateUserBalance);
  app.delete('/api/admin/users/:userId', AdminController.deleteUser);
  app.post('/api/admin/notifications/system', AdminController.createSystemNotification);
  app.get('/api/admin/stats', AdminController.getSystemStats);

  // ============================================================================
  // JUICE SHOP MODULE ROUTES
  // ============================================================================
  
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