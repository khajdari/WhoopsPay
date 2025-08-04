import { Request, Response } from 'express';
import { storage } from '../../storage';
import { URLAdapter } from '../../utils/urlAdapter';

/**
 * Juice Shop Controller - External E-commerce Integration
 * 
 * Simulates integration with OWASP Juice Shop for external payment processing
 */
export class JuiceShopController {
  /**
   * Get available products from Juice Shop
   * VULNERABILITY: No authentication - exposes all products
   */
  static async getProducts(req: Request, res: Response) {
    try {
      // VULNERABLE: No authentication check - exposes all products
      const mockProducts = [
        {
          id: 1,
          name: "Apple Juice (1000ml)",
          description: "The all-time classic.",
          price: 1.99,
          image: "/assets/public/images/products/apple_juice.jpg"
        },
        {
          id: 2,
          name: "Orange Juice (1000ml)", 
          description: "Made from oranges hand-picked by the shop manager.",
          price: 2.99,
          image: "/assets/public/images/products/orange_juice.jpg"
        },
        {
          id: 3,
          name: "Eggfruit Juice (500ml)",
          description: "Now with even more exotic flavour.",
          price: 8.99,
          image: "/assets/public/images/products/eggfruit_juice.jpg"
        },
        {
          id: 4,
          name: "Raspberry Juice (1000ml)",
          description: "Made from blended Raspberry Pi, water and sugar.",
          price: 4.99,
          image: "/assets/public/images/products/raspberry_juice.jpg"
        }
      ];

      res.json({
        status: 'success',
        data: mockProducts
      });
    } catch (error) {
      console.error("Error fetching Juice Shop products:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Failed to fetch products" 
      });
    }
  }

  /**
   * Create order in Juice Shop
   * VULNERABILITY: No input validation
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const { items, customerInfo } = req.body;
      
      // VULNERABLE: No input validation
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Items are required'
        });
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Generate order ID
      const orderId = Date.now().toString();

      const order = {
        id: orderId,
        items,
        customerInfo: customerInfo || {},
        total: total.toFixed(2),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      res.json({
        status: 'success',
        data: order
      });
    } catch (error) {
      console.error("Error creating Juice Shop order:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to create order"
      });
    }
  }

  /**
   * Get order details
   * VULNERABILITY: Direct object reference without authorization
   */
  static async getOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      
      // VULNERABLE: No authorization check - anyone can view any order
      if (!orderId) {
        return res.status(400).json({
          status: 'error',
          message: 'Order ID is required'
        });
      }

      // Mock order data - in real implementation this would come from database
      const order = {
        id: orderId,
        items: [
          { name: "Manual Order", quantity: 1, price: 0.89 }
        ],
        total: "0.89",
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      res.json({
        status: 'success',
        data: order
      });
    } catch (error) {
      console.error("Error fetching Juice Shop order:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to fetch order"
      });
    }
  }

  /**
   * Process payment for Juice Shop order
   * VULNERABILITY: No authentication or payment validation
   */
  static async processPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { userId, paymentMethod } = req.body;
      
      // VULNERABLE: No authentication or payment validation
      if (!orderId || !userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Order ID and User ID are required'
        });
      }

      // Mock order retrieval
      const order = {
        id: orderId,
        total: 0.89,
        items: [{ name: "Manual Order", quantity: 1, price: 0.89 }]
      };

      // Create external payment request in WhoopsPay
      try {
        const returnUrl = URLAdapter.adaptExternalUrl('/juice-shop?success=1');
        const cancelUrl = URLAdapter.adaptExternalUrl('/juice-shop?cancelled=1');

        const request = await storage.createMoneyRequest({
          fromUserId: "juice-shop",
          toUserId: userId,
          amount: order.total,
          description: `Juice Shop Order #${orderId}`,
          status: "pending",
          type: "external",
          externalOrderId: orderId,
          externalSource: "juice-shop",
          returnUrl: returnUrl,
          cancelUrl: cancelUrl,
          externalMetadata: JSON.stringify({
            items: order.items,
            merchant: "OWASP Juice Shop"
          })
        });

        res.json({
          status: 'success',
          message: 'Payment request created',
          data: {
            requestId: request.id,
            redirectUrl: `/payment-approval?requestId=${request.id}`,
            order: order
          }
        });
      } catch (storageError) {
        console.error("Error creating payment request:", storageError);
        res.status(500).json({
          status: 'error',
          message: "Failed to create payment request"
        });
      }
    } catch (error) {
      console.error("Error processing Juice Shop payment:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to process payment"
      });
    }
  }
}