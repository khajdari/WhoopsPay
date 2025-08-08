/**
 * WhoopsPay Issue Report Controller - OWASP Vulnerability Training
 * 
 * WARNING: This controller contains intentional security vulnerabilities for educational purposes.
 * 
 * OWASP Top 10 Vulnerabilities Demonstrated:
 * - A01: Broken Access Control (Missing authorization on sensitive endpoints)
 * - A03: Injection (Unvalidated input processing)
 * - A04: Insecure Design (Missing business logic validation)
 * - A05: Security Misconfiguration (Verbose error messages)
 * - A09: Security Logging and Monitoring Failures (Insufficient audit logging)
 * 
 * Educational Vulnerabilities Include:
 * - Issue reports accessible without proper user verification
 * - Admin functions exposed without proper authorization
 * - Unvalidated user input processing
 * - Missing rate limiting on report submissions
 * - Verbose error messages revealing system information
 * 
 * NEVER use this code in production environments!
 */

import type { Request, Response } from "express";
import { storage } from "../storage";
import { insertIssueReportSchema } from "@shared/schema";
import { logStore } from "../middleware/adminMiddleware";

export class IssueReportController {
  /**
   * Create new issue report
   * VULNERABILITY: Missing rate limiting and input validation
   */
  static async createIssueReport(req: Request, res: Response) {
    try {
      const { title, description, category, priority } = req.body;
      const userId = req.session?.userId;

      // VULNERABILITY: Basic validation but no rate limiting
      if (!title || !description || !category || !priority) {
        return res.status(400).json({
          error: "Missing required fields: title, description, category, priority"
        });
      }

      // VULNERABILITY: No user authentication check
      if (!userId) {
        return res.status(401).json({
          error: "User not authenticated"
        });
      }

      // Prepare issue report data
      const reportData = {
        userId,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'open',
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // VULNERABILITY: No input sanitization
      const report = await storage.createIssueReport(reportData);

      // Log the activity (minimal logging)
      logStore.addDbLog(`Issue report created: ${report.id} by user: ${userId}`);

      res.status(201).json({
        success: true,
        data: report,
        message: "Issue report submitted successfully"
      });

    } catch (error) {
      // VULNERABILITY: Verbose error messages
      console.error("Error creating issue report:", error);
      res.status(500).json({
        error: "Failed to create issue report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Get user's issue reports
   * VULNERABILITY: Missing authorization checks
   */
  static async getUserIssueReports(req: Request, res: Response) {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({
          error: "User not authenticated"
        });
      }

      const reports = await storage.getUserIssueReports(userId);

      res.json({
        success: true,
        data: reports
      });

    } catch (error) {
      console.error("Error fetching user issue reports:", error);
      res.status(500).json({
        error: "Failed to fetch issue reports",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Get all issue reports (Admin function)
   * VULNERABILITY: No admin authorization check
   */
  static async getAllIssueReports(req: Request, res: Response) {
    try {
      // VULNERABILITY: Missing admin authorization check
      const reports = await storage.getAllIssueReports();

      res.json({
        success: true,
        data: reports,
        count: reports.length
      });

    } catch (error) {
      console.error("Error fetching all issue reports:", error);
      res.status(500).json({
        error: "Failed to fetch all issue reports",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Get specific issue report
   * VULNERABILITY: No ownership verification
   */
  static async getIssueReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.id);
      
      if (isNaN(reportId)) {
        return res.status(400).json({
          error: "Invalid report ID"
        });
      }

      const report = await storage.getIssueReport(reportId);

      if (!report) {
        return res.status(404).json({
          error: "Issue report not found"
        });
      }

      // VULNERABILITY: No ownership verification - any authenticated user can view any report
      res.json({
        success: true,
        data: report
      });

    } catch (error) {
      console.error("Error fetching issue report:", error);
      res.status(500).json({
        error: "Failed to fetch issue report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Update issue report status (Admin function)
   * VULNERABILITY: No admin authorization
   */
  static async updateIssueReportStatus(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      if (isNaN(reportId)) {
        return res.status(400).json({
          error: "Invalid report ID"
        });
      }

      if (!status) {
        return res.status(400).json({
          error: "Status is required"
        });
      }

      // VULNERABILITY: No admin authorization check
      const updatedReport = await storage.updateIssueReportStatus(reportId, status, adminNotes);

      logStore.addDbLog(`Issue report ${reportId} status updated to: ${status}`);

      res.json({
        success: true,
        data: updatedReport,
        message: "Issue report status updated successfully"
      });

    } catch (error) {
      console.error("Error updating issue report status:", error);
      res.status(500).json({
        error: "Failed to update issue report status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}