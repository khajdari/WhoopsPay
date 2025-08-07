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
  static async approveRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      
      // OWASP A01: Broken Access Control - Insecure Direct Object Reference
      // CRITICAL VULNERABILITY: No authorization check - anyone can approve any payment request
      // This allows attackers to approve financial transactions they don't own
      const request = await storage.getMoneyRequest(parseInt(requestId));
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
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

      // For internal requests, update user balances
      if (request.toUserId && request.fromUserId !== "juice-shop") {
        const toUser = await storage.getUser(request.toUserId);
        if (toUser) {
          const newBalance = parseFloat(toUser.balance || '0') + parseFloat(request.amount.toString());
          await storage.updateUserBalance(request.toUserId, newBalance.toFixed(2));

          // Create notification for the user
          try {
            await storage.createNotification({
              userId: request.toUserId,
              type: "payment",
              title: "Payment Received",
              message: `You received $${request.amount} from ${request.description}`,
              isRead: 0
            });
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
          }

          return res.json({
            message: "Payment request approved successfully",
            request: updatedRequest,
            newBalance: newBalance
          });
        }
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
  static async rejectRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      
      // VULNERABLE: No authorization check
      const request = await storage.getMoneyRequest(parseInt(requestId));
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request is not pending" });
      }

      // Update request status to rejected
      const updatedRequest = await storage.updateMoneyRequestStatus(parseInt(requestId), "rejected");

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
      const pendingRequests = await storage.getPendingMoneyRequests("pending-user-selection");
      const matchingRequest = pendingRequests.find((request: any) => 
        request.externalOrderId === orderId && request.toUserId === "pending-user-selection"
      );

      if (!matchingRequest) {
        return res.status(404).json({ message: "External payment request not found" });
      }

      // Update the request to be assigned to this user - using a simple approach since updateMoneyRequest doesn't exist
      // Delete the old request and create a new one with the correct user
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