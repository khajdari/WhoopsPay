// File: routes/payment.js
// Add these routes to your existing Juice Shop backend

const express = require('express');
const router = express.Router();
const security = require('../lib/insecurity');
const utils = require('../lib/utils');
const challenges = require('../data/datacache').challenges;
const models = require('../models/index');

// PayPwned Integration Routes
router.post('/paypwned/initiate', security.isAccounting(), async (req, res, next) => {
  try {
    const { basketId, email, deliveryModeId, deliveryAddress } = req.body;
    
    // Get basket details
    const basket = await models.Basket.findOne({
      where: { id: basketId },
      include: [{
        model: models.BasketItem,
        include: [models.Product]
      }]
    });

    if (!basket) {
      return res.status(404).json({ error: 'Basket not found' });
    }

    // Calculate total price
    const totalPrice = basket.BasketItems.reduce((total, item) => {
      return total + (item.Product.price * item.quantity);
    }, 0);

    // Create order record
    const order = await models.Order.create({
      orderId: `juice-shop-${Date.now()}`,
      email: email,
      totalPrice: totalPrice,
      bonus: 0,
      deliveryPrice: 0.99,
      eta: '1',
      delivered: false,
      basketId: basketId
    });

    // Prepare PayPwned payment request
    const paymentRequest = {
      amount: totalPrice + 0.99, // Include delivery fee
      orderId: order.orderId,
      source: 'juice-shop',
      returnUrl: `${req.protocol}://${req.get('host')}/api/payment/paypwned/return?orderId=${order.id}`,
      cancelUrl: `${req.protocol}://${req.get('host')}/basket`,
      description: 'OWASP Juice Shop Purchase',
      metadata: {
        items: basket.BasketItems.map(item => ({
          name: item.Product.name,
          quantity: item.quantity,
          price: item.Product.price
        })),
        basketId: basketId,
        customer: email,
        deliveryAddress: deliveryAddress,
        orderId: order.id
      }
    };

    // Get PayPwned URL from configuration
    const paypwnedUrl = process.env.PAYPWNED_URL || 'https://paypwned.replit.app';

    // Initiate payment with PayPwned
    const fetch = require('node-fetch');
    const paymentResponse = await fetch(`${paypwnedUrl}/api/external/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest)
    });

    const paymentResult = await paymentResponse.json();

    if (paymentResult.success) {
      // Store PayPwned transaction ID
      await order.update({
        paymentTransactionId: paymentResult.transactionId,
        paymentStatus: 'pending'
      });

      res.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        orderId: order.id,
        transactionId: paymentResult.transactionId
      });
    } else {
      await order.destroy();
      res.status(400).json({ error: 'PayPwned payment initiation failed' });
    }

  } catch (error) {
    console.error('PayPwned payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Handle return from PayPwned
router.get('/paypwned/return', async (req, res, next) => {
  try {
    const { orderId, status, transactionId } = req.query;

    const order = await models.Order.findByPk(orderId);
    if (!order) {
      return res.redirect('/basket?error=order_not_found');
    }

    if (status === 'success') {
      // Verify payment with PayPwned
      const paypwnedUrl = process.env.PAYPWNED_URL || 'https://paypwned.replit.app';
      const fetch = require('node-fetch');
      
      const verificationResponse = await fetch(
        `${paypwnedUrl}/api/external/payment/${transactionId}/status`
      );
      const verification = await verificationResponse.json();

      if (verification.success && verification.transaction.status === 'completed') {
        // Mark order as completed
        await order.update({
          paymentStatus: 'completed',
          delivered: false
        });

        // Clear the basket
        const basket = await models.Basket.findByPk(order.basketId);
        if (basket) {
          await models.BasketItem.destroy({ where: { BasketId: basket.id } });
        }

        // Redirect to order completion page
        res.redirect(`/order-completion?orderId=${order.orderId}&success=true`);
      } else {
        await order.update({ paymentStatus: 'verification_failed' });
        res.redirect('/basket?error=payment_verification_failed');
      }
    } else {
      // Payment was cancelled or failed
      await order.update({ paymentStatus: 'cancelled' });
      res.redirect('/basket?cancelled=true');
    }

  } catch (error) {
    console.error('PayPwned return handling error:', error);
    res.redirect('/basket?error=true');
  }
});

// Get payment status
router.get('/paypwned/status/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await models.Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        transactionId: order.paymentTransactionId,
        totalPrice: order.totalPrice
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

module.exports = router;