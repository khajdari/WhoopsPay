# WhoopsPay Architecture Guide

## System Overview

WhoopsPay follows a modern fullstack architecture with clear separation of concerns, implementing both secure practices and intentional vulnerabilities for educational purposes.

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React/TS      │◄──►│   Express/TS    │◄──►│  PostgreSQL     │
│   Port: 5000    │    │   API Server    │    │   Drizzle ORM   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Juice Shop     │    │  External APIs  │
│  Integration    │    │  (Payments)     │
└─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
whoopspay/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── controllers/       # Business logic controllers
│   ├── middleware/        # Express middleware
│   ├── routes/           # API route definitions
│   ├── modules/          # Feature modules (Juice Shop)
│   └── config.ts         # Environment configuration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema (Drizzle)
├── .github/workflows/    # CI/CD security pipeline
└── attached_assets/      # Static assets and reports
```

## 🎯 Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query + React hooks
- **Routing**: Wouter (lightweight router)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Component Architecture
```
App.tsx
├── AuthProvider (Authentication context)
├── ThemeProvider (Dark/light mode)
├── Router
    ├── PublicLayout
    │   ├── LoginPage
    │   └── RegisterPage
    └── PrivateLayout
        ├── Dashboard
        ├── Transactions
        ├── PaymentMethods
        └── Profile
```

### Security Features (Frontend)
- Session-based authentication with automatic logout
- Input validation using Zod schemas
- CSRF protection through custom headers
- XSS prevention via React's built-in sanitization

## 🖥️ Backend Architecture

### Technology Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with express-session
- **API Documentation**: Swagger/OpenAPI
- **Security**: CORS, rate limiting, input validation

### MVC Architecture
```
Request → Middleware → Controller → Service → Database
                ↓
         Response ← View/JSON ←────────────┘
```

### API Structure
```
/api
├── /auth              # Authentication endpoints
├── /users             # User management
├── /transactions      # Financial transactions
├── /payment-methods   # Payment method CRUD
├── /money-requests    # Cross-user payments
├── /notifications     # User notifications
├── /admin             # Administrative functions
└── /external          # External integrations
```

### Database Architecture

#### Core Tables
- **users**: User accounts with intentionally mixed security
- **transactions**: Financial transaction records
- **payment_methods**: Credit cards and bank accounts
- **money_requests**: Cross-user payment requests
- **notifications**: Real-time user notifications
- **sessions**: User session storage

#### Intentional Vulnerabilities
- Plain text sensitive data storage
- Missing proper foreign key constraints
- Excessive data exposure in API responses
- Weak encryption standards for some fields

## 🔌 Integration Architecture

### Juice Shop Integration
WhoopsPay integrates with OWASP Juice Shop for cross-platform payment simulation:

```
Juice Shop → Checkout → WhoopsPay Payment → Return to Juice Shop
```

**Integration Points:**
- External payment processing endpoint
- Order correlation and validation
- Cross-domain authentication handling

### External Services
- **PayPal SDK**: Real payment processing simulation
- **OWASP ZAP**: Security testing integration
- **Snyk**: Vulnerability scanning services

## 🚀 Deployment Architecture

### Development Environment
```
localhost:5000 → Vite Dev Server → Express API → Local PostgreSQL
```

### Production Environment (Docker)
```
Docker Container → Express Server (Port 5000) → External PostgreSQL
```

### CI/CD Pipeline
```
GitHub Push → Security Pipeline → Docker Build → Registry Push → Deployment
```

## 🔐 Security Architecture

### Authentication Flow
```
User → Login → Session Creation → JWT Token → API Access
                      ↓
            Database Session Storage
```

### Authorization Layers
1. **Route-level**: Middleware authentication checks
2. **Resource-level**: Object ownership validation  
3. **Field-level**: Sensitive data access control

### Intentional Security Gaps
- Missing authorization checks on some endpoints
- Direct object reference vulnerabilities
- Insufficient input validation
- Weak session management
- Plain text sensitive data storage

## 📊 Data Flow Architecture

### Typical Transaction Flow
```
User Input → Form Validation → API Request → Controller
                                               ↓
Database ← Service Layer ← Business Logic ← Validation
                                               ↓
Response → JSON Serialization → Client Update
```

### Real-time Features
- WebSocket connections for notifications
- Live transaction updates
- Cross-user payment request notifications

## 🛠️ Development Practices

### Code Organization
- **Controllers**: Thin layer for request/response handling
- **Services**: Business logic and data manipulation
- **Models**: Database schema and relationships
- **Types**: Shared TypeScript definitions

### Error Handling
- Centralized error middleware
- Intentionally verbose error messages (educational vulnerability)
- Comprehensive logging with security implications

## 🎓 Educational Value

This architecture demonstrates:
- **Secure Patterns**: Modern full-stack development practices
- **Vulnerability Patterns**: Real-world security flaws
- **Defense Strategies**: How proper security should be implemented
- **Testing Approaches**: Comprehensive security testing pipeline

The architecture balances realistic application patterns with educational security vulnerabilities, providing a comprehensive learning environment for cybersecurity professionals.