import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTransactionSchema } from '@shared/schema';

export class TransactionController {
  /**
   * Create a new transaction
   * VULNERABILITY: No authentication check - anyone can create transactions
   */
  static async createTransaction(req: Request, res: Response) {
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
  }

  /**
   * Get all transactions
   * VULNERABILITY: No authentication - returns all transactions
   */
  static async getAllTransactions(req: Request, res: Response) {
    try {
      // VULNERABLE: No authentication - returns all transactions
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  }

  /**
   * Get pending transactions for a specific user
   */
  static async getPendingTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const pendingTransactions = await storage.getPendingTransactions(userId);
      res.json(pendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  }

  /**
   * Approve a transaction
   */
  static async approveTransaction(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransaction(parseInt(transactionId));

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Update balances
      const fromUser = await storage.getUser(transaction.fromUserId);
      const toUser = await storage.getUser(transaction.toUserId);

      if (!fromUser || !toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const amount = parseFloat(transaction.amount.toString());
      const fromBalance = parseFloat(fromUser.balance || '0') - amount;
      const toBalance = parseFloat(toUser.balance || '0') + amount;

      // VULNERABLE: No checks for negative balances
      await storage.updateUserBalance(transaction.fromUserId, fromBalance.toString());
      await storage.updateUserBalance(transaction.toUserId, toBalance.toString());

      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(parseInt(transactionId), "completed");

      res.json({
        message: "Transaction approved successfully",
        transaction: updatedTransaction,
        newBalance: toBalance
      });
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ message: "Failed to approve transaction" });
    }
  }

  /**
   * Reject a transaction
   */
  static async rejectTransaction(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransaction(parseInt(transactionId));

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(parseInt(transactionId), "rejected");

      res.json({
        message: "Transaction rejected successfully",
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      res.status(500).json({ message: "Failed to reject transaction" });
    }
  }
}