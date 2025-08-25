import { Request, Response } from 'express';
import { storage } from '../../storage';
import { URLAdapter } from '../../utils/urlAdapter';

// In-memory basket storage for demo (in real app, would use session or database)
const baskets: { [sessionId: string]: any[] } = {};

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
          toUserId: "pending-user-selection", // This will be updated when user logs in
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
            redirectUrl: URLAdapter.adaptExternalUrl(`/?orderId=${orderId}`),
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

  /**
   * Get basket items for current session
   * VULNERABILITY: Session-based but insecure
   */
  static async getBasketItems(req: Request, res: Response) {
    try {
      // Use the same global basket for demo consistency
      const sessionId = 'global-demo-basket';
      const basketItems = baskets[sessionId] || [];

      // Transform items to include product details
      const products = [
        { id: 1, name: "Apple Juice (1000ml)", price: 1.99, description: "The all-time classic." },
        { id: 2, name: "Orange Juice (1000ml)", price: 2.99, description: "Made from oranges hand-picked by the shop manager." },
        { id: 3, name: "Eggfruit Juice (500ml)", price: 8.99, description: "Now with even more exotic flavour." },
        { id: 4, name: "Raspberry Juice (1000ml)", price: 4.99, description: "Made from blended Raspberry Pi, water and sugar." }
      ];

      const itemsWithProducts = basketItems.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product: products.find(p => p.id === item.productId) || { id: item.productId, name: 'Unknown Product', price: 0, description: '' }
      }));

      res.json({
        status: 'success',
        data: itemsWithProducts
      });
    } catch (error) {
      console.error("Error fetching basket items:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to fetch basket items"
      });
    }
  }

  /**
   * Add item to basket
   * VULNERABILITY: No validation on product ID or quantity
   */
  static async addToBasket(req: Request, res: Response) {
    try {
      const { ProductId, quantity = 1 } = req.body;
      // Use a more reliable session approach for demo - use a global basket since session might not work consistently
      const sessionId = 'global-demo-basket';
      
      if (!ProductId) {
        return res.status(400).json({
          status: 'error',
          message: 'ProductId is required'
        });
      }

      if (!baskets[sessionId]) {
        baskets[sessionId] = [];
      }

      // Check if item already exists in basket
      const existingItem = baskets[sessionId].find((item: any) => item.productId === ProductId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        baskets[sessionId].push({
          id: Date.now(),
          productId: ProductId,
          quantity: quantity
        });
      }

      res.json({
        status: 'success',
        message: 'Item added to basket'
      });
    } catch (error) {
      console.error("Error adding to basket:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to add item to basket"
      });
    }
  }

  /**
   * Remove item from basket
   * VULNERABILITY: No authorization check
   */
  static async removeFromBasket(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const sessionId = 'global-demo-basket';

      if (!baskets[sessionId]) {
        return res.status(404).json({
          status: 'error',
          message: 'Basket not found'
        });
      }

      baskets[sessionId] = baskets[sessionId].filter((item: any) => item.id !== parseInt(itemId));

      res.json({
        status: 'success',
        message: 'Item removed from basket'
      });
    } catch (error) {
      console.error("Error removing from basket:", error);
      res.status(500).json({
        status: 'error',
        message: "Failed to remove item from basket"
      });
    }
  }

  /**
   * Checkout and process payment
   * VULNERABILITY: Multiple security issues
   */
  static async checkout(req: Request, res: Response) {
    try {
      const { paymentMethod } = req.body;
      const sessionId = 'global-demo-basket';
      const basketItems = baskets[sessionId] || [];

      if (basketItems.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Basket is empty'
        });
      }

      // Calculate total
      const products = [
        { id: 1, name: "Apple Juice (1000ml)", price: 1.99 },
        { id: 2, name: "Orange Juice (1000ml)", price: 2.99 },
        { id: 3, name: "Eggfruit Juice (500ml)", price: 8.99 },
        { id: 4, name: "Raspberry Juice (1000ml)", price: 4.99 }
      ];

      let total = 0;
      const orderItems = basketItems.map((item: any) => {
        const product = products.find(p => p.id === item.productId);
        const itemTotal = (product?.price || 0) * item.quantity;
        total += itemTotal;
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: product?.price || 0,
          total: itemTotal
        };
      });

      const orderId = `JS-${Date.now()}`;

      if (paymentMethod === 'whoopspay') {
        // Create external payment request in WhoopsPay system - will be pending until user approves
        try {
          // Create the money request that will appear in user's pending requests
          const request = await storage.createMoneyRequest({
            fromUserId: "juice-shop",  // External merchant
            toUserId: "pending-user-selection", // Will be updated when user logs in
            amount: total,
            description: `OWASP Juice Shop Order #${orderId} - ${orderItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}`,
            status: "pending",
            type: "external",
            externalOrderId: orderId,
            externalSource: "juice-shop",
            returnUrl: URLAdapter.adaptExternalUrl(`/juice-shop?success=1&orderId=${orderId}`),
            cancelUrl: URLAdapter.adaptExternalUrl(`/juice-shop?cancelled=1&orderId=${orderId}`),
            externalMetadata: JSON.stringify({
              items: orderItems,
              merchant: "OWASP Juice Shop",
              total: total.toFixed(2)
            })
          });

          // Clear basket after successful order
          delete baskets[sessionId];

          res.json({
            status: 'success',
            orderId: orderId,
            requestId: request.id,
            paymentUrl: URLAdapter.adaptExternalUrl('/'),  // Redirect to WhoopsPay login
            message: 'Payment request created - login to WhoopsPay to approve'
          });
        } catch (storageError) {
          console.error("Error creating payment request:", storageError);
          res.status(500).json({
            status: 'error',
            message: "Failed to create payment request"
          });
        }
      } else {
        // Handle other payment methods (mock)
        delete baskets[sessionId];
        
        res.json({
          status: 'success',
          orderId: orderId,
          total: total.toFixed(2),
          message: `Payment processed with ${paymentMethod}`
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).json({
        status: 'error',
        message: "Checkout failed"
      });
    }
  }
}