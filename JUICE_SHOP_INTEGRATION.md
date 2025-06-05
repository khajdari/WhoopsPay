# OWASP Juice Shop Integration with WhoopsPay

This document explains how to run and test the complete integration between WhoopsPay (main application) and the separate OWASP Juice Shop application.

## Architecture Overview

The integration consists of two separate applications:

1. **WhoopsPay** (Main Application) - Port 5000
   - Payment processing platform
   - User authentication and management
   - External payment processing API

2. **OWASP Juice Shop** (Separate Application) - Port 3001
   - E-commerce storefront
   - Product catalog and shopping cart
   - Integration with WhoopsPay for payments

## Running Both Applications

### Step 1: Start WhoopsPay (Main Application)
```bash
# In the root directory
npm run dev
```
This starts WhoopsPay on http://localhost:5000

### Step 2: Start Juice Shop (Separate Application)
```bash
# In a new terminal, navigate to juice-shop directory
cd juice-shop
npm run dev
```
This starts:
- Juice Shop backend server on port 3001
- Juice Shop frontend on port 3001 (served by Vite)

## Integration Flow

### Payment Processing Flow
1. User browses products on Juice Shop (http://localhost:3001)
2. User adds items to shopping cart
3. User clicks "Pay with WhoopsPay" button
4. User is redirected to WhoopsPay external payment flow
5. User logs into WhoopsPay (if not already authenticated)
6. User sees payment confirmation modal with transaction details
7. User approves or cancels the payment
8. User is redirected back to Juice Shop with payment status

### API Integration Points

#### Juice Shop → WhoopsPay
- **Payment Initiation**: Juice Shop calls its own `/api/payment/initiate` endpoint
- **Redirect**: User is redirected to WhoopsPay external payment URL
- **Return**: User returns to Juice Shop with payment status

#### WhoopsPay External Payment API
- `POST /api/external/payment` - Process external payments
- Handles payment confirmation and transaction recording
- Creates notifications for successful payments

## Testing the Integration

### Test Scenario 1: Successful Payment
1. Open Juice Shop: http://localhost:3001
2. Add "Apple Pomace" to cart (it's in stock)
3. Click "Pay with WhoopsPay"
4. You'll be redirected to WhoopsPay
5. Log in with demo credentials:
   - Username: `demo@whoopspay.com`
   - Password: `demo123`
6. Approve the payment in the confirmation modal
7. You'll be redirected back to Juice Shop with success message

### Test Scenario 2: Payment Cancellation
1. Follow steps 1-5 from above
2. Cancel the payment in the confirmation modal
3. You'll be redirected back to Juice Shop with cancellation message

### Test Scenario 3: Admin User Flow
1. Log in as admin:
   - Username: `admin@whoopspay.com`
   - Password: `admin123`
2. Process payment and verify transaction appears in admin dashboard

## File Structure

```
juice-shop/
├── package.json              # Separate dependencies
├── vite.config.ts            # Vite configuration for port 3001
├── tsconfig.json             # TypeScript configuration
├── server/
│   └── index.ts              # Express server with product catalog
└── client/
    ├── index.html            # Juice Shop HTML entry point
    ├── src/
    │   ├── main.tsx          # React entry point
    │   ├── App.tsx           # Main Juice Shop component
    │   └── index.css         # Juice Shop styling
```

## Key Features

### Juice Shop Application
- Product catalog with Apple Pomace, Carrot Juice, Green Smoothie
- Shopping cart functionality
- Stock management (some items out of stock)
- Payment status handling (success/cancelled/error)
- Responsive design with gradient background

### WhoopsPay Integration
- External payment processing API
- Payment confirmation modal
- Transaction recording and notifications
- Return URL handling with status parameters
- Cross-origin request handling (CORS configured)

## Security Considerations

This integration demonstrates several OWASP vulnerabilities for educational purposes:
- Open redirects in payment flow
- Insufficient input validation
- Missing CSRF protection
- Verbose error messages
- Unencrypted sensitive data transmission

**WARNING**: This is for educational/training purposes only. Never use in production.

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 5000 and 3001 are available
2. **CORS Errors**: Both applications are configured to allow cross-origin requests
3. **Payment Redirect Issues**: Check that return URLs are properly encoded
4. **Database Issues**: WhoopsPay uses SQLite, ensure write permissions

### Logs

- **WhoopsPay Logs**: Check terminal running main application
- **Juice Shop Logs**: Check terminal in juice-shop directory
- **Browser Console**: Check for frontend errors

## Development

### Adding New Products
Edit `juice-shop/server/index.ts` and modify the `products` array.

### Modifying Payment Flow
Edit the payment initiation logic in `juice-shop/client/src/App.tsx` and the WhoopsPay external payment API in the main application's `server/routes.ts`.

### Styling Changes
Modify `juice-shop/client/src/index.css` for Juice Shop styling or the main application's CSS for WhoopsPay styling.