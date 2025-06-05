# Juice Shop Integration Technical Documentation

## Overview

This document provides detailed technical specifications for the integration between OWASP Juice Shop and WhoopsPay payment platform. The integration demonstrates real-world e-commerce payment flows while maintaining educational security vulnerabilities for training purposes.

## Integration Architecture

### Component Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Payment Integration Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Juice Shop]                                   [WhoopsPay]     │
│       │                                              │          │
│       ├─ 1. User adds products to cart               │          │
│       ├─ 2. User clicks "Pay with WhoopsPay"        │          │
│       ├─ 3. POST /api/payment/initiate ──────────►  │          │
│       │                                              ├─ 4. Create transaction │
│       │                                              ├─ 5. Return payment URL │
│       ├─ 6. ◄────────── Redirect to payment page ──┤          │
│       │                                              ├─ 7. User authentication │
│       │                                              ├─ 8. Payment approval UI │
│       │                                              ├─ 9. Process payment │
│       ├─ 10. ◄───────── Redirect with status ───────┤          │
│       ├─ 11. Display order confirmation              │          │
│       │                                              │          │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Integration Points

#### 1. Payment Initiation Endpoint
- **Endpoint**: `POST /api/external/payment/initiate`
- **Purpose**: Creates pending transaction in WhoopsPay system
- **Called by**: Juice Shop checkout process
- **Response**: Payment URL for user redirection

#### 2. Payment Processing Page
- **Route**: `/payment-processing`
- **Purpose**: Intermediate processing and user redirection
- **Parameters**: Transaction ID, amount, description, return URLs

#### 3. Payment Approval Interface
- **Route**: `/external-payment/{transactionId}`
- **Purpose**: User interface for payment approval/rejection
- **Authentication**: Required (redirects to login if needed)

#### 4. Status Check Endpoint
- **Endpoint**: `GET /api/external/payment/{transactionId}/status`
- **Purpose**: Real-time transaction status monitoring
- **Polling**: Every 5 seconds for pending transactions

## API Specifications

### Payment Initiation Request

```json
POST /api/external/payment/initiate
Content-Type: application/json

{
  "amount": 15.99,
  "orderId": "JS-ORDER-12345",
  "source": "juice-shop",
  "description": "Apple Juice x2, Banana Juice x1",
  "returnUrl": "http://localhost:3001/payment-success",
  "cancelUrl": "http://localhost:3001/payment-cancel",
  "metadata": {
    "items": [
      {
        "id": 1,
        "name": "Apple Juice",
        "price": 1.99,
        "quantity": 2
      },
      {
        "id": 2,
        "name": "Banana Juice",
        "price": 12.01,
        "quantity": 1
      }
    ],
    "customer": {
      "email": "customer@example.com",
      "sessionId": "juice-shop-session-abc123"
    }
  }
}
```

### Payment Initiation Response

```json
{
  "success": true,
  "paymentUrl": "http://localhost:5000/external-payment/42",
  "transactionId": 42,
  "status": "pending",
  "expiresAt": "2024-01-15T14:30:00Z"
}
```

### Transaction Status Response

```json
{
  "success": true,
  "transaction": {
    "id": 42,
    "fromUserId": "external",
    "toUserId": "merchant",
    "amount": 15.99,
    "description": "Apple Juice x2, Banana Juice x1",
    "status": "external_pending",
    "type": "external_payment",
    "createdAt": 1705321800000,
    "externalOrderId": "JS-ORDER-12345",
    "externalSource": "juice-shop",
    "returnUrl": "http://localhost:3001/payment-success",
    "cancelUrl": "http://localhost:3001/payment-cancel",
    "externalMetadata": "{\"items\":[...],\"customer\":{...}}"
  },
  "status": "external_pending"
}
```

## Juice Shop Configuration

### Server Setup (start-juice-shop.cjs)

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for WhoopsPay integration
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Product catalog
const products = [
  {
    id: 1,
    name: "Apple Juice",
    description: "Fresh apple juice from local orchards",
    price: 1.99,
    image: "/images/apple-juice.jpg",
    category: "beverages"
  },
  {
    id: 2,
    name: "Banana Juice",
    description: "Tropical banana smoothie blend",
    price: 12.01,
    image: "/images/banana-juice.jpg",
    category: "beverages"
  }
];

// Shopping cart storage (in-memory for demo)
let shoppingCarts = new Map();

// Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/cart/add', (req, res) => {
  const { sessionId, productId, quantity } = req.body;
  
  if (!shoppingCarts.has(sessionId)) {
    shoppingCarts.set(sessionId, []);
  }
  
  const cart = shoppingCarts.get(sessionId);
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  res.json({ success: true, cart });
});

app.get('/api/cart/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const cart = shoppingCarts.get(sessionId) || [];
  
  const cartWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product,
      subtotal: product.price * item.quantity
    };
  });
  
  const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
  
  res.json({ items: cartWithDetails, total });
});

// Payment integration endpoint
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { sessionId, items, total } = req.body;
    
    // Generate unique order ID
    const orderId = `JS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare payment request for WhoopsPay
    const paymentRequest = {
      amount: total,
      orderId: orderId,
      source: 'juice-shop',
      description: `Order ${orderId} - ${items.length} items`,
      returnUrl: `http://localhost:3001/payment-success?orderId=${orderId}`,
      cancelUrl: `http://localhost:3001/payment-cancel?orderId=${orderId}`,
      metadata: {
        items: items,
        customer: {
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    // Call WhoopsPay payment initiation
    const response = await fetch('http://localhost:5000/api/external/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Payment initiation failed: ${response.status}`);
    }
    
    const paymentResponse = await response.json();
    
    // Store order information
    orders.set(orderId, {
      id: orderId,
      sessionId: sessionId,
      items: items,
      total: total,
      status: 'pending_payment',
      transactionId: paymentResponse.transactionId,
      createdAt: new Date().toISOString()
    });
    
    // Clear cart after initiating payment
    shoppingCarts.delete(sessionId);
    
    res.json({
      success: true,
      orderId: orderId,
      paymentUrl: paymentResponse.paymentUrl,
      transactionId: paymentResponse.transactionId
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: error.message
    });
  }
});

// Payment success callback
app.get('/payment-success', async (req, res) => {
  const { orderId, transactionId } = req.query;
  
  try {
    // Verify payment status with WhoopsPay
    const statusResponse = await fetch(`http://localhost:5000/api/external/payment/${transactionId}/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success && statusData.transaction.status === 'approved') {
      // Update order status
      const order = orders.get(orderId);
      if (order) {
        order.status = 'completed';
        order.paymentCompletedAt = new Date().toISOString();
      }
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Successful - Juice Shop</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #28a745; }
            .order-details { background: #f8f9fa; padding: 20px; margin: 20px auto; max-width: 500px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Payment Successful!</h1>
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> $${order ? order.total.toFixed(2) : 'N/A'}</p>
            <p><strong>Status:</strong> Completed</p>
          </div>
          <a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Return to Shop</a>
        </body>
        </html>
      `);
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    res.status(500).send(`
      <h1>Payment Verification Error</h1>
      <p>Unable to verify payment status. Please contact support.</p>
      <p>Order ID: ${orderId}</p>
      <a href="/">Return to Shop</a>
    `);
  }
});

// Payment cancellation callback
app.get('/payment-cancel', (req, res) => {
  const { orderId } = req.query;
  
  // Update order status
  const order = orders.get(orderId);
  if (order) {
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled - Juice Shop</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .cancelled { color: #dc3545; }
      </style>
    </head>
    <body>
      <h1 class="cancelled">❌ Payment Cancelled</h1>
      <p>Your payment was cancelled. Your items are still in your cart.</p>
      <a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Return to Shop</a>
    </body>
    </html>
  `);
});

console.log(`Juice Shop server running on http://localhost:${PORT}`);
app.listen(PORT);
```

## WhoopsPay Integration Components

### External Payment Processing

The external payment system handles transactions from third-party applications like Juice Shop through a secure API interface.

#### Transaction States

```
external_pending → approved → completed
                ↘ rejected → failed
```

#### Security Considerations (Educational Vulnerabilities)

1. **Insufficient Authorization**: Any authenticated user can approve external payments
2. **Data Exposure**: Transaction details exposed without proper access control
3. **Missing Rate Limiting**: No protection against payment bombing attacks
4. **Weak Session Management**: Sessions not properly invalidated
5. **CSRF Vulnerability**: No CSRF protection on payment approval endpoints

### Database Schema Integration

```sql
-- External payment fields in transactions table
ALTER TABLE transactions ADD COLUMN external_order_id TEXT;
ALTER TABLE transactions ADD COLUMN external_source TEXT;
ALTER TABLE transactions ADD COLUMN return_url TEXT;
ALTER TABLE transactions ADD COLUMN cancel_url TEXT;
ALTER TABLE transactions ADD COLUMN external_metadata TEXT;

-- Indexes for external payment queries
CREATE INDEX idx_transactions_external_order ON transactions(external_order_id);
CREATE INDEX idx_transactions_external_source ON transactions(external_source);
CREATE INDEX idx_transactions_status_type ON transactions(status, type);
```

## Frontend Integration

### Payment Processing Page

```typescript
// client/src/pages/payment-processing.tsx
export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const description = searchParams.get('description');
  const returnUrl = searchParams.get('returnUrl');
  
  useEffect(() => {
    const initializePayment = async () => {
      if (transactionId && amount) {
        try {
          // Create transaction in WhoopsPay system
          const response = await fetch("/api/external/payment/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: parseFloat(amount),
              orderId: transactionId,
              source: 'juice-shop',
              description: description || 'External payment',
              returnUrl: returnUrl || '',
              cancelUrl: cancelUrl || ''
            })
          });
          
          const result = await response.json();
          
          // Redirect to approval page
          setTimeout(() => {
            setLocation(`/external-payment/${result.transactionId}`);
          }, 3000);
          
        } catch (error) {
          console.error('Payment initialization failed:', error);
        }
      }
    };
    
    initializePayment();
  }, [transactionId, amount, description, returnUrl]);
  
  // Countdown and loading UI...
}
```

### External Payment Modal

```typescript
// client/src/pages/ExternalPayment.tsx
export default function ExternalPayment() {
  const { transactionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  // Fetch transaction details with polling
  const { data: response, isLoading } = useQuery({
    queryKey: [`/api/external/payment/${transactionId}/status`],
    enabled: !!transactionId,
    refetchInterval: (data) => {
      return data?.transaction?.status === "external_pending" ? 5000 : false;
    },
  });
  
  const transaction = response?.transaction;
  
  // Payment approval/rejection mutations
  const approveMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/external/payment/${transactionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      // Redirect back to Juice Shop with success status
      window.location.href = transaction?.returnUrl || '/';
    }
  });
  
  // Approval modal UI with transaction details...
}
```

## Testing Procedures

### Manual Testing Steps

1. **Start Both Services**
   ```bash
   # Terminal 1: WhoopsPay
   npm run dev
   
   # Terminal 2: Juice Shop
   node start-juice-shop.cjs
   ```

2. **Test Product Browsing**
   - Navigate to `http://localhost:3001`
   - Verify product catalog loads
   - Add items to cart

3. **Test Payment Initiation**
   - Click "Pay with WhoopsPay"
   - Verify redirect to WhoopsPay
   - Check transaction creation

4. **Test Authentication Flow**
   - Login with demo credentials
   - Verify session persistence
   - Check user authorization

5. **Test Payment Approval**
   - Review payment details
   - Approve or reject payment
   - Verify status updates

6. **Test Return Flow**
   - Verify redirect back to Juice Shop
   - Check order confirmation
   - Validate transaction completion

### Automated Testing

```bash
# API endpoint tests
curl -X POST http://localhost:5000/api/external/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{"amount": 1.99, "orderId": "TEST-123", "source": "juice-shop"}'

# Status check
curl -s http://localhost:5000/api/external/payment/1/status

# Integration test script
npm run test:integration
```

## Troubleshooting Guide

### Common Integration Issues

1. **CORS Errors**: Ensure both services allow cross-origin requests
2. **Port Conflicts**: Verify services run on correct ports (3001, 5000)
3. **Database Connectivity**: Check PostgreSQL connection and schema
4. **Session Issues**: Clear browser storage and restart services
5. **API Timeouts**: Verify network connectivity between services

### Debug Commands

```bash
# Check service status
curl -s http://localhost:3001/health
curl -s http://localhost:5000/api/health

# Monitor logs
tail -f logs/juice-shop.log
tail -f logs/whoopspay.log

# Database inspection
psql -d whoopspay_db -c "SELECT * FROM transactions WHERE external_source = 'juice-shop';"
```

## Security Training Scenarios

The integration provides several educational security scenarios:

1. **Payment Manipulation**: Modify transaction amounts during processing
2. **Session Hijacking**: Steal and reuse authentication sessions
3. **CSRF Attacks**: Force users to approve payments without consent
4. **Data Exposure**: Access other users' transaction data
5. **Privilege Escalation**: Gain administrative access to payment system

Each scenario includes guided exploitation steps and mitigation strategies for comprehensive security training.

---

**Warning**: This integration contains intentional security vulnerabilities for educational purposes. Never deploy in production environments.