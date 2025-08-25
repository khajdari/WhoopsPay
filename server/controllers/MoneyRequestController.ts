/**
 * WhoopsPay Money Request Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (IDOR, insufficient authorization checks)
 * - A04: Insecure Design (Missing business logic validation for financial operations)
 * - A05: Security Misconfiguration (Unrestricted external redirects)
 * - A07: Identification and Authentication Failures (Weak ownership validation)
 * - A09: Security Logging and Monitoring Failures (Insufficient financial transaction logging)
 * 
 * API Security Top 10 Vulnerabilities:
 * - API1: Broken Object Level Authorization (No request ownership validation)
 * - API6: Unrestricted Access to Sensitive Business Flows (Financial approvals)
 * - API7: Server Side Request Forgery (Unvalidated redirects)
 * - API10: Unsafe Consumption of APIs (External URL handling)
 * 
 * Financial Security Vulnerabilities:
 * - Anyone can approve payment requests without ownership validation
 * - Unvalidated external redirects to potentially malicious sites
 * - Missing financial transaction approval workflows
 * - No fraud detection for suspicious payment patterns
 * 
 * NEVER use this code in production environments!
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { URLAdapter } from '../utils/urlAdapter';

export class MoneyRequestController {
  /**
   * Get pending payment requests for the current user
   * 
   * NOTE: This method has proper authentication - included for contrast
   */
  static async getPendingRequests(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get pending requests specifically for this user
      const pendingRequests = await storage.getPendingMoneyRequests(userId);
      res.json(pendingRequests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  }

  /**
   * Approve an external payment request
   * 
   * OWASP VULNERABILITIES DEMONSTRATED:
   * - A01: Broken Access Control (IDOR - no ownership validation)
   * - API1: Broken Object Level Authorization (Anyone can approve any request)
   * - A04: Insecure Design (Missing financial approval controls)
   * - API7: Server Side Request Forgery (Unvalidated external redirects)
   */
  static async approveRequest(req: any, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const request = await storage.getMoneyRequest(parseInt(requestId));
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Check if user is authorized to approve this request (for internal requests)
      if (request.type === "internal" && request.fromUserId !== userId) {
        return res.status(403).json({ message: "You can only approve requests sent to you" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request is not pending" });
      }

      // Update request status to approved
      const updatedRequest = await storage.updateMoneyRequestStatus(parseInt(requestId), "approved");

      // Check if this is an external request (from juice-shop or other external sources)
      if (request.type === "external" && request.externalSource) {
        console.log("Sending external redirect response:", {
          message: 'External payment approved successfully',
          redirect: true,
          redirectUrl: request.returnUrl,
          request: updatedRequest,
          external: true
        });

        // OWASP A05: Security Misconfiguration & API7: Server Side Request Forgery
        // VULNERABLE: Unvalidated external redirects - potential open redirect vulnerability
        // For external requests, return redirect information
        return res.json({
          message: 'External payment approved successfully',
          redirect: true,
          redirectUrl: request.returnUrl, // VULNERABLE: No URL validation
          request: updatedRequest,
          external: true
        });
      }

      // For internal requests, process the money transfer
      if (request.toUserId && request.fromUserId !== "juice-shop" && request.type === "internal") {
        // Get both users
        const fromUser = await storage.getUser(request.fromUserId);
        const toUser = await storage.getUser(request.toUserId);
        
        if (!fromUser || !toUser) {
          return res.status(404).json({ message: "User not found" });
        }

        const transferAmount = parseFloat(request.amount.toString());
        const fromBalance = parseFloat(fromUser.balance || '0');
        const toBalance = parseFloat(toUser.balance || '0');

        // Check if sender has sufficient funds
        if (fromBalance < transferAmount) {
          return res.status(400).json({ message: "Insufficient funds to complete the request" });
        }

        // Calculate new balances
        const newFromBalance = fromBalance - transferAmount;
        const newToBalance = toBalance + transferAmount;

        // Update both user balances
        console.log(`Updating balances: From ${request.fromUserId} (${fromBalance} -> ${newFromBalance}), To ${request.toUserId} (${toBalance} -> ${newToBalance})`);
        await storage.updateUserBalance(request.fromUserId, newFromBalance.toFixed(2));
        await storage.updateUserBalance(request.toUserId, newToBalance.toFixed(2));
        console.log("Balance updates completed successfully");

        // Create a transaction record for the payment transfer
        try {
          await storage.createTransaction({
            fromUserId: request.fromUserId,
            toUserId: request.toUserId,
            amount: transferAmount,
            description: request.description || "Money Request Payment",
            status: "completed",
            type: "transfer",
            transactionCategory: "ONUS",
            isInternal: 1
          });
        } catch (transactionError) {
          console.error("Error creating transaction record:", transactionError);
        }

        // Create a transaction record for the request approval
        try {
          await storage.createTransaction({
            fromUserId: request.fromUserId,
            toUserId: request.toUserId,
            amount: request.amount,
            description: `Money request approved: ${request.description || "Money request"}`,
            status: "approved",
            type: "money_request",
            transactionCategory: request.type === "external" ? "OFFUS" : "ONUS",
            isInternal: request.type === "internal" ? 1 : 0
          });
        } catch (transactionError) {
          console.error("Error creating approval transaction record:", transactionError);
        }

        // Create notifications for both users
        try {
          await storage.createNotification({
            userId: request.toUserId,
            type: "payment",
            title: "Payment Received",
            message: `You received ¤${request.amount} from ${fromUser.firstName || fromUser.email}${request.description ? ` for: ${request.description}` : ''}`,
            isRead: 0
          });

          await storage.createNotification({
            userId: request.fromUserId,
            type: "payment",
            title: "Payment Sent",
            message: `You sent ¤${request.amount} to ${toUser.firstName || toUser.email}${request.description ? ` for: ${request.description}` : ''}`,
            isRead: 0
          });

          // Additional approval notification for the requester
          await storage.createNotification({
            userId: request.toUserId,
            type: "money_request_approved",
            title: "Money Request Approved",
            message: `${fromUser.firstName || fromUser.email} approved your request for ¤${request.amount}${request.description ? ` for: ${request.description}` : ''}`,
            isRead: 0
          });
        } catch (notificationError) {
          console.error("Error creating notifications:", notificationError);
        }

        return res.json({
          message: "Payment request approved successfully",
          request: updatedRequest,
          fromBalance: newFromBalance,
          toBalance: newToBalance
        });
      }

      res.json({
        message: "Request approved successfully",
        request: updatedRequest
      });
    } catch (error) {
      console.error("Error approving request:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  }

  /**
   * Reject an external payment request
   * VULNERABILITY: No authorization check
   */
  static async rejectRequest(req: any, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const request = await storage.getMoneyRequest(parseInt(requestId));
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Check if user is authorized to reject this request (for internal requests)
      if (request.type === "internal" && request.fromUserId !== userId) {
        return res.status(403).json({ message: "You can only reject requests sent to you" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request is not pending" });
      }

      // Update request status to rejected
      const updatedRequest = await storage.updateMoneyRequestStatus(parseInt(requestId), "rejected");

      // Create a transaction record for the rejection
      try {
        const rejectorUser = await storage.getUser(userId);
        await storage.createTransaction({
          fromUserId: request.fromUserId,
          toUserId: request.toUserId,
          amount: request.amount,
          description: `Money request rejected: ${request.description || "Money request"}`,
          status: "rejected",
          type: "money_request",
          transactionCategory: request.type === "external" ? "OFFUS" : "ONUS",
          isInternal: request.type === "internal" ? 1 : 0
        });
      } catch (transactionError) {
        console.error("Error creating rejection transaction record:", transactionError);
      }

      // Create rejection notification for the person who made the request
      try {
        const rejectorUser = await storage.getUser(userId);
        const requesterUser = await storage.getUser(request.toUserId);
        
        await storage.createNotification({
          userId: request.toUserId, // Send notification to the person who made the request
          type: "money_request_rejected",
          title: "Money Request Rejected",
          message: `${rejectorUser?.firstName || rejectorUser?.email} rejected your request for ¤${request.amount}${request.description ? ` for: ${request.description}` : ''}`,
          isRead: 0
        });
      } catch (notificationError) {
        console.error("Error creating rejection notification:", notificationError);
      }

      // For external requests, return redirect information to cancel URL
      if (request.type === "external" && request.externalSource) {
        return res.json({
          message: 'External payment rejected',
          redirect: true,
          redirectUrl: request.cancelUrl, // This should already be adapted by URLAdapter
          request: updatedRequest,
          external: true
        });
      }

      res.json({
        message: "Request rejected successfully",
        request: updatedRequest
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  }

  /**
   * Create a new internal money request
   * VULNERABILITY: Minimal validation and authorization
   */
  static async createInternalRequest(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fromUserId, amount, description } = req.body;

      // Basic validation
      if (!fromUserId || !amount) {
        return res.status(400).json({ message: "From user and amount are required" });
      }

      if (fromUserId === userId) {
        return res.status(400).json({ message: "Cannot request money from yourself" });
      }

      // Verify the target user exists
      const fromUser = await storage.getUser(fromUserId);
      if (!fromUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create the money request
      const request = await storage.createMoneyRequest({
        fromUserId: fromUserId, // Who will pay
        toUserId: userId, // Who is requesting (current user)
        amount: parseFloat(amount),
        description: description || "Money request",
        status: "pending",
        type: "internal"
      });

      // Create a transaction record for the money request creation
      try {
        await storage.createTransaction({
          fromUserId: fromUserId,
          toUserId: userId,
          amount: parseFloat(amount),
          description: `Money request created: ${description || "Money request"}`,
          status: "pending",
          type: "money_request",
          transactionCategory: "ONUS",
          isInternal: 1
        });
      } catch (transactionError) {
        console.error("Error creating money request transaction record:", transactionError);
      }

      // Create notification for the person being asked to pay
      try {
        const currentUser = await storage.getUser(userId);
        await storage.createNotification({
          userId: fromUserId,
          type: "money_request",
          title: "Money Request",
          message: `${currentUser?.firstName || currentUser?.email} is requesting ¤${amount}${description ? ` for: ${description}` : ''}`,
          isRead: 0
        });
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }

      res.json({
        message: "Money request created successfully",
        request: request
      });
    } catch (error) {
      console.error("Error creating internal money request:", error);
      res.status(500).json({ message: "Failed to create money request" });
    }
  }

  /**
   * Create a new external payment request
   * VULNERABILITY: No authentication or validation
   */
  static async createExternalRequest(req: Request, res: Response) {
    try {
      // VULNERABLE: No authentication or input validation
      const { 
        amount, 
        description, 
        toUserId, 
        externalOrderId, 
        externalSource,
        returnUrl,
        cancelUrl,
        externalMetadata 
      } = req.body;

      // VULNERABLE: Minimal validation
      if (!amount || !toUserId) {
        return res.status(400).json({ message: "Amount and user ID are required" });
      }

      // Adapt URLs using URLAdapter
      const adaptedReturnUrl = URLAdapter.adaptExternalUrl(returnUrl);
      const adaptedCancelUrl = URLAdapter.adaptExternalUrl(cancelUrl);

      const request = await storage.createMoneyRequest({
        fromUserId: externalSource || "external",
        toUserId: toUserId,
        amount: parseFloat(amount),
        description: description || "",
        status: "pending",
        type: "external",
        externalOrderId: externalOrderId,
        externalSource: externalSource,
        returnUrl: adaptedReturnUrl,
        cancelUrl: adaptedCancelUrl,
        externalMetadata: externalMetadata
      });

      // Create notification for the target user
      try {
        const user = await storage.getUser(toUserId);
        if (user) {
          await storage.createNotification({
            userId: toUserId,
            type: "external_payment",
            title: "External Payment Request",
            message: `External payment request for $${amount} from ${externalSource || 'External Source'}`,
            isRead: 0
          });
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }

      res.json({
        message: "External payment request created successfully",
        requestId: request.id,
        status: "pending"
      });
    } catch (error) {
      console.error("Error creating external request:", error);
      res.status(500).json({ message: "Failed to create external request" });
    }
  }

  /**
   * Assign an external payment request to the current logged-in user
   * This is called when a user logs in after an external checkout
   */
  static async assignExternalRequestToUser(req: any, res: Response) {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // Find the pending external request for this order
      const unassignedRequests = await storage.findUnassignedExternalRequest(orderId);
      
      if (unassignedRequests.length === 0) {
        return res.status(404).json({ message: "External payment request not found" });
      }
      
      const matchingRequest = unassignedRequests[0];

      // Delete the old unassigned request
      await storage.deleteMoneyRequest(matchingRequest.id);

      // Create a new request assigned to this user
      const newRequest = await storage.createMoneyRequest({
        fromUserId: matchingRequest.fromUserId,
        toUserId: userId,
        amount: matchingRequest.amount,
        description: matchingRequest.description,
        status: "pending",
        type: matchingRequest.type,
        externalOrderId: matchingRequest.externalOrderId,
        externalSource: matchingRequest.externalSource,
        returnUrl: matchingRequest.returnUrl,
        cancelUrl: matchingRequest.cancelUrl,
        externalMetadata: matchingRequest.externalMetadata
      });

      // Create notification for the user
      await storage.createNotification({
        userId: userId,
        type: "external_payment",
        title: "External Payment Request",
        message: `Payment request from ${matchingRequest.externalSource} for ¤${matchingRequest.amount.toFixed(2)}`,
        isRead: 0
      });

      res.json({
        message: "External payment request assigned successfully",
        requestId: newRequest.id,
        status: "pending"
      });
    } catch (error) {
      console.error("Error assigning external request:", error);
      res.status(500).json({ message: "Failed to assign external request" });
    }
  }
}