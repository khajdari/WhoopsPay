# OWASP Juice Shop + PayPwned Integration Guide

## Overview

This integration allows OWASP Juice Shop users to complete their checkout process through PayPwned's payment system. Users are redirected from Juice Shop to PayPwned for payment approval/rejection, then returned to Juice Shop with the final result.

## Integration Flow

```
1. Juice Shop Checkout → PayPwned Payment Request
2. User redirected to PayPwned authentication
3. User approves/rejects payment in PayPwned
4. User redirected back to Juice Shop with result
```

## API Endpoints

### 1. Initiate Payment (From Juice Shop)

**POST** `/api/external/payment/initiate`

```json
{
  "amount": 29.99,
  "orderId": "juice-shop-order-12345",
  "source": "juice-shop",
  "returnUrl": "http://localhost:3000/basket#/order-completion",
  "cancelUrl": "http://localhost:3000/basket",
  "description": "OWASP Juice Shop Purchase",
  "metadata": {
    "items": ["Apple Juice", "Orange Juice"],
    "customer": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://paypwned.replit.app/external-payment/123",
  "transactionId": 123,
  "status": "pending"
}
```

### 2. Payment Status Check

**GET** `/api/external/payment/{transactionId}/status`

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 123,
    "status": "external_pending|completed|rejected",
    "amount": 29.99,
    "externalOrderId": "juice-shop-order-12345"
  }
}
```

### 3. User Payment Actions (Authenticated)

**POST** `/api/external/payment/{transactionId}/approve`
**POST** `/api/external/payment/{transactionId}/reject`

## Juice Shop Integration Code

### Frontend Integration (Angular/TypeScript)

```typescript
// In your checkout service
export class CheckoutService {
  
  async initiatePayPwnedPayment(orderData: any): Promise<string> {
    const paymentRequest = {
      amount: orderData.totalPrice,
      orderId: orderData.id,
      source: 'juice-shop',
      returnUrl: `${window.location.origin}/basket#/order-completion`,
      cancelUrl: `${window.location.origin}/basket`,
      description: 'OWASP Juice Shop Purchase',
      metadata: {
        items: orderData.products.map(p => p.name),
        customer: orderData.email
      }
    };

    const response = await fetch('https://paypwned.replit.app/api/external/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest)
    });

    const result = await response.json();
    
    if (result.success) {
      // Redirect to PayPwned for payment approval
      window.location.href = result.paymentUrl;
      return result.transactionId;
    }
    
    throw new Error('Failed to initiate payment');
  }
}
```

### Backend Integration (Node.js/Express)

```javascript
// In your checkout routes
app.post('/api/checkout/paypwned', async (req, res) => {
  try {
    const { basketId, email } = req.body;
    
    // Get basket details
    const basket = await getBasket(basketId);
    const totalPrice = calculateTotal(basket.items);
    
    // Create order
    const order = await createOrder({
      basketId,
      email,
      totalPrice,
      status: 'pending_payment'
    });
    
    // Initiate PayPwned payment
    const paymentRequest = {
      amount: totalPrice,
      orderId: order.id,
      source: 'juice-shop',
      returnUrl: `${process.env.BASE_URL}/basket#/order-completion?orderId=${order.id}`,
      cancelUrl: `${process.env.BASE_URL}/basket`,
      description: 'OWASP Juice Shop Purchase'
    };
    
    const paymentResponse = await fetch('https://paypwned.replit.app/api/external/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentRequest)
    });
    
    const paymentResult = await paymentResponse.json();
    
    if (paymentResult.success) {
      // Store transaction ID for later verification
      await updateOrder(order.id, { 
        paymentTransactionId: paymentResult.transactionId 
      });
      
      res.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl
      });
    } else {
      res.status(400).json({ error: 'Payment initiation failed' });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Handle return from PayPwned
app.get('/api/checkout/paypwned/return', async (req, res) => {
  try {
    const { orderId, status, transactionId } = req.query;
    
    if (status === 'success') {
      // Verify payment with PayPwned
      const verificationResponse = await fetch(
        `https://paypwned.replit.app/api/external/payment/${transactionId}/status`
      );
      const verification = await verificationResponse.json();
      
      if (verification.transaction.status === 'completed') {
        await updateOrder(orderId, { 
          status: 'completed',
          paymentStatus: 'paid'
        });
        
        res.redirect(`/basket#/order-completion?success=true&orderId=${orderId}`);
      } else {
        res.redirect(`/basket#/order-completion?success=false&error=payment_verification_failed`);
      }
    } else {
      await updateOrder(orderId, { 
        status: 'cancelled',
        paymentStatus: 'cancelled'
      });
      
      res.redirect(`/basket?cancelled=true`);
    }
    
  } catch (error) {
    res.redirect(`/basket?error=true`);
  }
});
```

## Frontend UI Integration

### Add PayPwned Payment Option

```html
<!-- In your checkout form -->
<div class="payment-methods">
  <div class="payment-option">
    <input type="radio" id="paypwned" name="paymentMethod" value="paypwned">
    <label for="paypwned">
      <img src="/assets/paypwned-logo.png" alt="PayPwned">
      Pay with PayPwned
      <span class="security-badge">🔒 Secure External Payment</span>
    </label>
  </div>
  
  <!-- Other payment methods -->
  <div class="payment-option">
    <input type="radio" id="credit-card" name="paymentMethod" value="card">
    <label for="credit-card">Credit Card</label>
  </div>
</div>

<button (click)="proceedWithPayment()" class="checkout-btn">
  Complete Purchase
</button>
```

```typescript
// In your component
proceedWithPayment() {
  const selectedMethod = this.getSelectedPaymentMethod();
  
  if (selectedMethod === 'paypwned') {
    this.checkoutService.initiatePayPwnedPayment(this.orderData)
      .then(transactionId => {
        // User will be redirected to PayPwned
        console.log('Redirecting to PayPwned for payment approval');
      })
      .catch(error => {
        this.showError('Payment initiation failed. Please try again.');
      });
  } else {
    // Handle other payment methods
    this.processStandardPayment();
  }
}
```

## Security Considerations (Educational Vulnerabilities)

⚠️ **WARNING: This integration contains intentional security vulnerabilities for educational purposes**

### Demonstrated Vulnerabilities:

1. **Missing CSRF Protection**: External payment endpoints lack CSRF tokens
2. **Insufficient Authorization**: Any authenticated user can approve payments
3. **Data Exposure**: Full transaction details exposed without proper access control
4. **No Rate Limiting**: Payment approval/rejection endpoints lack rate limiting
5. **Weak Validation**: Minimal input validation on payment initiation
6. **Information Disclosure**: Verbose error messages reveal system internals

### Production Security Recommendations:

- Implement proper CSRF protection
- Add role-based access control for payment approvals
- Use secure redirect URL validation
- Implement comprehensive input validation
- Add rate limiting and fraud detection
- Use minimal data exposure principles
- Implement proper audit logging

## Testing the Integration

### Manual Testing Steps:

1. **Start OWASP Juice Shop** (typically on `http://localhost:3000`)
2. **Start PayPwned** (on your Replit deployment)
3. **Add items to Juice Shop basket**
4. **Select PayPwned payment method**
5. **Complete checkout process**
6. **Verify redirect to PayPwned**
7. **Login to PayPwned if not authenticated**
8. **Approve or reject the payment**
9. **Verify redirect back to Juice Shop**
10. **Check order status in Juice Shop**

### API Testing with cURL:

```bash
# 1. Initiate payment
curl -X POST https://paypwned.replit.app/api/external/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29.99,
    "orderId": "test-order-123",
    "source": "juice-shop",
    "returnUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel",
    "description": "Test Purchase"
  }'

# 2. Check payment status
curl https://paypwned.replit.app/api/external/payment/123/status

# 3. Simulate payment approval (requires authentication)
curl -X POST https://paypwned.replit.app/api/external/payment/123/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie"
```

## URL Examples

- **PayPwned Payment Page**: `https://paypwned.replit.app/external-payment/123`
- **Juice Shop Return URL**: `http://localhost:3000/basket#/order-completion?status=success&transactionId=123`
- **Juice Shop Cancel URL**: `http://localhost:3000/basket?status=cancelled&transactionId=123`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure PayPwned allows requests from Juice Shop domain
2. **Authentication Redirects**: Users may need to log in to PayPwned first
3. **URL Validation**: Check that return/cancel URLs are properly formatted
4. **Transaction Status**: Verify transaction status before completing orders

### Debugging Tips:

- Check browser developer tools for network requests
- Verify API responses and status codes
- Monitor PayPwned logs for error messages
- Test with different user accounts and scenarios

## Educational Value

This integration demonstrates:
- Cross-platform payment processing
- OAuth-like redirect flows
- API security vulnerabilities
- Real-world e-commerce payment patterns
- Security testing scenarios for penetration testers

Perfect for cybersecurity education and vulnerability assessment training.