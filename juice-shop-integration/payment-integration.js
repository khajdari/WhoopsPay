/**
 * Juice Shop - WhoopsPay Integration Module
 * 
 * This module provides seamless integration between OWASP Juice Shop
 * and the WhoopsPay payment platform for educational security testing.
 */

const axios = require('axios');

class WhoopsPayIntegration {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.WHOOPSPAY_API_URL || 'http://localhost:5000/api/juice-shop/payment-request';
    this.paymentUrl = config.paymentUrl || process.env.WHOOPSPAY_PAYMENT_URL || 'http://localhost:5000/login?redirect=/dashboard';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Create a payment request in WhoopsPay
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Payment request response
   */
  async createPaymentRequest(orderData) {
    try {
      const paymentRequest = {
        amount: parseFloat(orderData.total),
        currency: orderData.currency || 'USD',
        description: `Juice Shop Order - ${orderData.items.map(item => item.name).join(', ')}`,
        toUserId: orderData.userId || '@sarah_wilson', // Default user for demo
        externalOrderId: orderData.orderId,
        returnUrl: `${process.env.JUICE_SHOP_URL || 'http://localhost:3000'}/checkout/success`,
        cancelUrl: `${process.env.JUICE_SHOP_URL || 'http://localhost:3000'}/checkout/cancel`
      };

      console.log('[WhoopsPay Integration] Creating payment request:', paymentRequest);

      const response = await axios.post(this.apiUrl, paymentRequest, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Juice-Shop-Integration/1.0'
        }
      });

      if (response.data && response.data.redirectUrl) {
        return {
          success: true,
          redirectUrl: response.data.redirectUrl,
          requestId: response.data.requestId,
          message: 'Payment request created successfully'
        };
      } else {
        throw new Error('Invalid response from WhoopsPay API');
      }

    } catch (error) {
      console.error('[WhoopsPay Integration] Error creating payment request:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || 'Payment service error',
          statusCode: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Unable to connect to payment service',
          statusCode: 503
        };
      } else {
        return {
          success: false,
          error: 'Payment request failed',
          statusCode: 500
        };
      }
    }
  }

  /**
   * Handle payment success callback
   * @param {Object} callbackData - Payment callback data
   * @returns {Object} Processed order status
   */
  handlePaymentSuccess(callbackData) {
    console.log('[WhoopsPay Integration] Payment success callback:', callbackData);
    
    return {
      orderId: callbackData.orderId,
      status: 'completed',
      amount: callbackData.amount,
      transactionId: callbackData.requestId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle payment cancellation callback
   * @param {Object} callbackData - Payment callback data
   * @returns {Object} Processed order status
   */
  handlePaymentCancel(callbackData) {
    console.log('[WhoopsPay Integration] Payment cancelled:', callbackData);
    
    return {
      orderId: callbackData.orderId,
      status: 'cancelled',
      reason: 'User cancelled payment',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = WhoopsPayIntegration;