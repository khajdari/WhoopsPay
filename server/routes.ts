import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertPaymentMethodSchema } from "@shared/schema";
import { seedMockData } from "./mockData";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed mock data for vulnerability testing
  await seedMockData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // VULNERABLE: User search with SQL injection
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
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

  // Transaction endpoints
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // VULNERABLE: Insufficient input validation
      const transactionData = req.body;
      
      // WARNING: No validation of transaction limits or user permissions
      // Users can send any amount, even if they don't have sufficient balance
      const transaction = await storage.createTransaction({
        ...transactionData,
        fromUserId: userId,
      });

      // Update balances without proper checks
      if (transactionData.fromUserId && transactionData.toUserId && transactionData.amount) {
        const fromUser = await storage.getUser(transactionData.fromUserId);
        const toUser = await storage.getUser(transactionData.toUserId);
        
        if (fromUser && toUser) {
          const fromBalance = parseFloat(fromUser.balance || '0') - parseFloat(transactionData.amount);
          const toBalance = parseFloat(toUser.balance || '0') + parseFloat(transactionData.amount);
          
          // VULNERABLE: No checks for negative balances
          await storage.updateUserBalance(transactionData.fromUserId, fromBalance.toString());
          await storage.updateUserBalance(transactionData.toUserId, toBalance.toString());
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

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

  // Payment method endpoints
  app.post('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // VULNERABLE: Storing sensitive payment data without encryption
      const paymentMethodData = {
        ...req.body,
        userId,
      };
      
      // WARNING: Credit card numbers, CVV, etc. stored in plain text
      const paymentMethod = await storage.addPaymentMethod(paymentMethodData);
      res.json(paymentMethod);
    } catch (error) {
      console.error("Error adding payment method:", error);
      res.status(500).json({ message: "Failed to add payment method" });
    }
  });

  app.get('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // VULNERABLE: Insecure Direct Object Reference
  app.delete('/api/payment-methods/:id', async (req: any, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      
      // WARNING: No authentication or authorization checks
      // Any user can delete any payment method by guessing the ID
      await storage.deletePaymentMethod(paymentMethodId);
      res.json({ message: "Payment method deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
