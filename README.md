# WhoopsPay & OWASP Juice Shop Integration Platform

## Overview

WhoopsPay is an advanced cybersecurity training and financial management platform that integrates with OWASP Juice Shop to provide a comprehensive, hands-on learning environment for security professionals. The platform demonstrates OWASP Top 10 and API Security Top 10 vulnerabilities through intentionally vulnerable payment processing systems.

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Juice Shop    │◄──►│   WhoopsPay     │◄──►│   PostgreSQL    │
│  (Port 3001)    │    │  (Port 5000)    │    │   Database      │
│                 │    │                 │    │                 │
│ - Product Catalog│    │ - Payment APIs  │    │ - User Data     │
│ - Shopping Cart │    │ - Auth System   │    │ - Transactions  │
│ - Checkout Flow │    │ - Admin Panel   │    │ - Payment Methods│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Integration Flow

1. **Product Selection**: Users browse and select products in Juice Shop
2. **Checkout Initiation**: Juice Shop calls WhoopsPay payment API
3. **Payment Processing**: WhoopsPay creates transaction and redirects user
4. **Authentication**: User authenticates with WhoopsPay credentials
5. **Payment Approval**: User approves or rejects payment via modal interface
6. **Return to Shop**: User is redirected back to Juice Shop with payment status

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for development and build tooling
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for state management
- **Wouter** for client-side routing

#### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **Session-based authentication**
- **RESTful API** design

#### Security Features (Educational)
- **Intentional OWASP Top 10 vulnerabilities**
- **API Security Top 10 demonstrations**
- **SQL injection examples**
- **Authentication bypass scenarios**
- **Privilege escalation demonstrations**

## API Integration Points

### Payment Initiation
```
POST /api/external/payment/initiate
Content-Type: application/json

{
  "amount": 1.99,
  "orderId": "JS-12345",
  "source": "juice-shop",
  "description": "Apple Juice x1",
  "returnUrl": "http://localhost:3001/payment-success",
  "cancelUrl": "http://localhost:3001/payment-cancel"
}
```

### Payment Status Check
```
GET /api/external/payment/{transactionId}/status

Response:
{
  "success": true,
  "transaction": {
    "id": 18,
    "amount": 1.99,
    "status": "external_pending",
    "description": "Apple Juice x1"
  }
}
```

### Payment Approval/Rejection
```
POST /api/external/payment/{transactionId}/approve
POST /api/external/payment/{transactionId}/reject
```

## User Roles & Credentials

### Demo Accounts
- **Regular User**: `jdoe` / `password123`
- **Administrator**: `admin` / `admin123`
- **Moderator**: `moderator` / `mod123`

### Role Permissions
- **Users**: Basic payment operations, transaction history
- **Moderators**: User management, transaction monitoring
- **Administrators**: Full system access, vulnerability configuration

## Educational Vulnerabilities

### OWASP Top 10 (2021)
1. **A01: Broken Access Control** - Direct object references, privilege escalation
2. **A02: Cryptographic Failures** - Plain text sensitive data storage
3. **A03: Injection** - SQL injection in search and filter functions
4. **A04: Insecure Design** - Missing business logic validation
5. **A05: Security Misconfiguration** - Verbose error messages
6. **A07: Identification and Authentication Failures** - Weak session management
7. **A09: Security Logging and Monitoring Failures** - Insufficient audit logging

### API Security Top 10
1. **API1: Broken Object Level Authorization** - Access other users' data
2. **API2: Broken User Authentication** - JWT manipulation vulnerabilities
3. **API3: Broken Object Property Level Authorization** - Excessive data exposure
4. **API4: Unrestricted Resource Consumption** - No rate limiting
5. **API5: Broken Function Level Authorization** - Admin function access

## Features

### Core Functionality
- **Multi-language Support** (English, Greek)
- **Real-time Transaction Processing**
- **Interactive Payment Approval System**
- **Comprehensive Admin Dashboard**
- **API Documentation** with Swagger/OpenAPI
- **Cross-platform Integration**

### Security Training Features
- **Vulnerability Scenarios** with guided exploitation
- **Security Testing Environment**
- **Real-time Logging** and monitoring
- **Educational Documentation**
- **Hands-on Learning Modules**

## File Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── localAuth.ts        # Authentication logic
│   └── adminMiddleware.ts  # Admin functionality
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── juice-shop/             # Juice Shop integration
├── start-juice-shop.cjs    # Juice Shop server startup
└── simple-juice-shop.js    # Standalone Juice Shop implementation
```

## Development Workflow

### Starting the Application
1. **WhoopsPay Server**: `npm run dev` (Port 5000)
2. **Juice Shop Server**: `node start-juice-shop.cjs` (Port 3001)
3. **Database**: PostgreSQL (configured via environment variables)

### Testing the Integration
1. Navigate to Juice Shop: `http://localhost:3001`
2. Add products to cart
3. Click "Pay with WhoopsPay"
4. Complete authentication flow
5. Approve/reject payment
6. Verify return to Juice Shop

## Security Considerations

⚠️ **WARNING**: This platform contains intentional security vulnerabilities for educational purposes only. **NEVER** deploy this system in a production environment.

### Educational Use Only
- Designed for cybersecurity training
- Contains deliberately insecure code
- Should only be used in isolated environments
- All vulnerabilities are documented and intentional

### Safe Testing Environment
- Use only on local development machines
- Ensure proper network isolation
- Regular security awareness training
- Proper incident response procedures

## Support & Documentation

### Additional Resources
- **SECURITY_DOCUMENTATION.md** - Detailed vulnerability explanations
- **DEPLOYMENT.md** - Production deployment guidelines
- **JUICE_SHOP_INTEGRATION.md** - Integration technical details
- **LOCAL_SETUP.md** - Local development setup guide

### API Documentation
- Swagger UI available at: `http://localhost:5000/api-docs`
- Interactive API testing interface
- Complete endpoint documentation
- Authentication flow examples

---

**Disclaimer**: This software is provided for educational purposes only. The developers are not responsible for any misuse of the intentionally vulnerable code contained within this platform.