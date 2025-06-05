# OWASP Juice Shop + WhoopsPay Integration Deployment Guide

## Repository: https://github.com/khajdari/juice-shop

## Files to Add/Modify in Your Juice Shop Repository

### 1. Frontend Components

**File: `frontend/src/app/payment/payment.component.ts`**
- Replace existing payment component with the code from `juice-shop-payment-component.ts`
- Adds WhoopsPay payment option alongside existing credit card payment

**File: `frontend/src/app/payment/payment.component.html`**
- Replace existing template with the code from `juice-shop-payment-template.html`
- Adds WhoopsPay UI components and styling

### 2. Backend Routes

**File: `routes/payment.js`** (new file)
- Add the code from `juice-shop-backend-routes.js`
- Creates WhoopsPay integration endpoints

**File: `app.js`** (modify existing)
```javascript
// Add this line to register PayPwned routes
app.use('/api/payment', require('./routes/payment'))
```

### 3. Database Migration

**File: `migrations/YYYYMMDDHHMMSS-add-paypwned-fields.js`** (new file)
- Use the migration code from `juice-shop-database-migration.js`
- Adds payment tracking fields to Orders table

### 4. Configuration

**File: `config/default.yml`** (modify existing)
- Add WhoopsPay configuration from `juice-shop-configuration.yml`

**File: `.env`** (modify existing)
```
WHOOPSPAY_URL=https://whoopspay.replit.app
WHOOPSPAY_ENABLED=true
```

## Step-by-Step Deployment Instructions

### Step 1: Clone and Setup
```bash
git clone https://github.com/khajdari/juice-shop.git
cd juice-shop
npm install
```

### Step 2: Add WhoopsPay Integration Files
1. Copy `juice-shop-payment-component.ts` content to `frontend/src/app/payment/payment.component.ts`
2. Copy `juice-shop-payment-template.html` content to `frontend/src/app/payment/payment.component.html`
3. Create `routes/payment.js` with content from `juice-shop-backend-routes.js`
4. Create migration file with content from `juice-shop-database-migration.js`

### Step 3: Install Dependencies
```bash
# Add node-fetch for backend API calls
npm install node-fetch@2.6.1

# Frontend dependencies (if needed)
cd frontend
npm install
cd ..
```

### Step 4: Database Migration
```bash
# Run the migration to add PayPwned fields
npm run db:migrate

# Or manually add columns to SQLite database:
sqlite3 data/juiceshop.sqlite
ALTER TABLE Orders ADD COLUMN paymentTransactionId VARCHAR(255);
ALTER TABLE Orders ADD COLUMN paymentStatus VARCHAR(50) DEFAULT 'pending';
.exit
```

### Step 5: Configure Environment
```bash
# Add WhoopsPay configuration to .env
echo "WHOOPSPAY_URL=https://whoopspay.replit.app" >> .env
echo "WHOOPSPAY_ENABLED=true" >> .env
```

### Step 6: Update Application Routes
Add to `app.js`:
```javascript
// After existing route registrations
app.use('/api/payment', require('./routes/payment'))
```

### Step 7: Frontend Component Registration
Ensure PaymentComponent is properly imported and declared in the Angular module.

### Step 8: Build and Deploy
```bash
# Build frontend
npm run build

# Start the application
npm start
```

## Testing the Integration

### 1. Complete Purchase Flow
1. Add items to basket in Juice Shop
2. Go to checkout
3. Select "WhoopsPay" payment method
4. Complete order - should redirect to WhoopsPay
5. Login to WhoopsPay if not authenticated
6. Approve or reject payment
7. Verify redirect back to Juice Shop with result

### 2. API Testing
```bash
# Test WhoopsPay connectivity
curl https://whoopspay.replit.app/api/external/payment/17/status

# Test Juice Shop WhoopsPay endpoint
curl -X POST http://localhost:3000/api/payment/whoopspay/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "basketId": 1,
    "email": "test@example.com",
    "deliveryModeId": 1,
    "deliveryAddress": "Test Address"
  }'
```

## Configuration Options

### Development Environment
```env
WHOOPSPAY_URL=http://localhost:5000
WHOOPSPAY_ENABLED=true
```

### Production Environment
```env
WHOOPSPAY_URL=https://your-whoopspay-domain.com
WHOOPSPAY_ENABLED=true
```

## Security Considerations

This integration demonstrates educational security vulnerabilities:

1. **Missing CSRF Protection** - External payment endpoints lack CSRF tokens
2. **Insufficient Validation** - Minimal input validation on payment data
3. **Information Disclosure** - Verbose error messages
4. **Weak Authorization** - Any authenticated user can approve payments
5. **No Rate Limiting** - Payment endpoints lack rate limiting

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure WhoopsPay allows requests from Juice Shop domain
   - Configure proper CORS headers

2. **Database Migration Fails**
   - Check SQLite database permissions
   - Manually add columns if migration fails

3. **WhoopsPay Connectivity Issues**
   - Verify WHOOPSPAY_URL is correct
   - Check network connectivity
   - Ensure WhoopsPay service is running

4. **Frontend Build Errors**
   - Run `npm install` in frontend directory
   - Check Angular dependencies

### Debugging Commands
```bash
# Check Juice Shop logs
npm run start:dev

# Check database structure
sqlite3 data/juiceshop.sqlite ".schema Orders"

# Test WhoopsPay API
curl -I https://whoopspay.replit.app/api/external/payment/initiate
```

## Git Commands for Deployment

```bash
# Create feature branch
git checkout -b feature/whoopspay-integration

# Add all integration files
git add .

# Commit changes
git commit -m "Add WhoopsPay payment integration

- Added WhoopsPay payment option to checkout
- Implemented cross-platform payment flow
- Added external payment API endpoints
- Created payment verification system
- Educational security vulnerability demonstration"

# Push to your repository
git push origin feature/whoopspay-integration

# Create pull request on GitHub
# Merge to main branch when ready
```

## Final Verification

After deployment, verify:
1. PayPwned option appears in payment methods
2. Clicking PayPwned redirects to external payment page
3. Payment approval/rejection works correctly
4. Return redirect brings user back to Juice Shop
5. Order status is properly updated

The integration is now complete and functional for educational cybersecurity training purposes.