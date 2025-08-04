import { Request, Response } from 'express';
import { storage } from '../storage';
import { URLAdapter } from '../utils/urlAdapter';

export class MoneyRequestController {
  /**
   * Get all pending external payment requests
   * VULNERABILITY: No authentication check
   */
  static async getPendingRequests(req: Request, res: Response) {
    try {
      // VULNERABLE: No authentication check - returns all pending requests
      const pendingRequests = await storage.getPendingMoneyRequests("all");
      res.json(pendingRequests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  }

  /**
   * Approve an external payment request
   * VULNERABILITY: No authorization check - anyone can approve any request
   */
  static async approveRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      
      // VULNERABLE: No authorization check - anyone can approve any request
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

        // For external requests, return redirect information
        return res.json({
          message: 'External payment approved successfully',
          redirect: true,
          redirectUrl: request.returnUrl, // This should already be adapted by URLAdapter
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
}