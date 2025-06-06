# Juice Shop Payment Integration Guide

## Overview
WhoopsPay integrates with OWASP Juice Shop as an external payment processor, allowing Juice Shop customers to complete checkout payments through WhoopsPay's secure payment system.

## Integration Architecture

### Payment Flow
1. **Juice Shop Checkout**: Customer initiates checkout in Juice Shop
2. **Payment Request**: Juice Shop sends payment request to WhoopsPay
3. **User Authentication**: Customer logs into WhoopsPay if not already authenticated
4. **Payment Approval**: Customer approves or rejects payment in WhoopsPay dashboard
5. **Redirect Response**: Customer is redirected back to Juice Shop with payment status

### API Endpoints

#### Create Payment Request (Juice Shop → WhoopsPay)
```
POST /api/juice-shop/payment-request
Content-Type: application/json

{
  "amount": 25.99,
  "currency": "USD",
  "description": "Juice Shop Order",
  "toUserId": "@sarah_connor",
  "externalOrderId": "ORDER_12345",
  "returnUrl": "http://localhost:3000/api/payment/success",
  "cancelUrl": "http://localhost:3000/api/payment/cancel"
}
```

**Response:**
```json
{
  "message": "External payment request created",
  "requestId": 42,
  "paymentUrl": "http://localhost:5000/login?redirect=/dashboard"
}
```

#### Payment Approval/Rejection (WhoopsPay Internal)
- `POST /api/requests/{id}/approve` - Approve payment request
- `POST /api/requests/{id}/reject` - Reject payment request

### External Redirect Handling

#### Approval Response
```json
{
  "message": "External payment approved successfully",
  "redirect": true,
  "redirectUrl": "http://localhost:3000/api/payment/success?status=approved&orderId=ORDER_12345&amount=25.99",
  "request": { ... }
}
```

#### Rejection Response
```json
{
  "message": "External payment rejected successfully", 
  "redirect": true,
  "redirectUrl": "http://localhost:3000/api/payment/cancel?status=rejected&orderId=ORDER_12345",
  "request": { ... }
}
```

## Implementation Details

### Database Schema
The `money_requests` table handles external payment requests:

```sql
CREATE TABLE money_requests (
  id INTEGER PRIMARY KEY,
  fromUserId TEXT NOT NULL,     -- "juice-shop" for external requests
  toUserId TEXT NOT NULL,       -- WhoopsPay user ID
  amount REAL NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  type TEXT DEFAULT 'internal',  -- internal, external
  externalOrderId TEXT,         -- Juice Shop order ID
  externalSource TEXT,          -- "juice-shop"
  returnUrl TEXT,               -- Success redirect URL
  cancelUrl TEXT,               -- Cancel redirect URL
  externalMetadata TEXT,        -- Additional JSON metadata
  createdAt INTEGER,
  respondedAt INTEGER
);
```

### Frontend Integration
The WhoopsPay dashboard displays external payment requests with visual indicators:

- **Blue styling** for external requests vs orange for internal
- **External badge** to distinguish request types
- **Order ID display** for external order tracking
- **Automatic redirect** after approval/rejection for external requests

### Security Considerations (Educational Vulnerabilities)
This integration demonstrates several OWASP vulnerabilities for educational purposes:

1. **Missing CSRF Protection**: Payment approval/rejection endpoints lack CSRF tokens
2. **Insufficient Rate Limiting**: No rate limiting on payment operations
3. **Data Exposure**: Full transaction details exposed without proper authorization checks
4. **Missing Input Validation**: External payment parameters not properly sanitized

## Testing the Integration

### Manual Testing with cURL

1. **Create External Payment Request:**
```bash
curl -X POST http://localhost:5000/api/juice-shop/payment-request \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.99,
    "currency": "USD", 
    "description": "Test Juice Shop Order",
    "toUserId": "@sarah_connor",
    "externalOrderId": "TEST_ORDER_001",
    "returnUrl": "http://localhost:3000/api/payment/success",
    "cancelUrl": "http://localhost:3000/api/payment/cancel"
  }'
```

2. **Login to WhoopsPay:**
   - Navigate to http://localhost:5000
   - Login as @sarah_connor (password: sarah123)

3. **View Pending Request:**
   - External payment request appears in dashboard with blue styling
   - Shows "External" badge and order ID

4. **Approve/Reject Payment:**
   - Click Approve or Reject buttons
   - System automatically redirects to specified return/cancel URL

### Integration with Juice Shop

1. **Setup Juice Shop Backend Integration:**
   - Configure Juice Shop to use WhoopsPay as payment processor
   - Set WhoopsPay base URL: `http://localhost:5000`
   - Configure webhook endpoints for payment status updates

2. **Customer Checkout Flow:**
   - Customer adds items to Juice Shop cart
   - Selects "WhoopsPay" as payment method
   - Redirected to WhoopsPay for authentication and approval
   - Returns to Juice Shop with payment status

## Configuration

### Environment Variables
```bash
# WhoopsPay Configuration
WHOOPSPAY_BASE_URL=http://localhost:5000
JUICE_SHOP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=file:./whoopspay.db
```

### Juice Shop Configuration
Add to Juice Shop's payment configuration:
```yaml
payment_processors:
  whoopspay:
    name: "WhoopsPay"
    endpoint: "http://localhost:5000/api/juice-shop/payment-request"
    success_url: "http://localhost:3000/api/payment/success"
    cancel_url: "http://localhost:3000/api/payment/cancel"
```

## Error Handling

### Common Error Scenarios
1. **User Not Found**: Invalid `toUserId` in payment request
2. **Insufficient Funds**: User balance too low for payment amount
3. **Request Not Found**: Invalid request ID during approval/rejection
4. **Network Errors**: Connection issues between Juice Shop and WhoopsPay

### Error Responses
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "details": "No user found with ID: @invalid_user"
}
```

## Monitoring and Logging

### Payment Request Logs
```
[INFO] External payment request created: Order TEST_ORDER_001, Amount: $25.99, User: @sarah_connor
[INFO] Payment approved: Request ID 42, redirecting to success URL
[WARN] Payment rejected: Request ID 43, redirecting to cancel URL
```

### Admin Dashboard Monitoring
Administrators can monitor external payment requests through the WhoopsPay admin panel:
- View all external payment requests
- Track approval/rejection rates
- Monitor integration health

This integration provides a realistic e-commerce payment flow while demonstrating common security vulnerabilities for educational cybersecurity training.