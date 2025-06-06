# WhoopsPay Architecture Documentation

## System Overview

WhoopsPay is a full-stack educational security training platform built with modern web technologies. The architecture follows a client-server pattern with clear separation of concerns, intentional security vulnerabilities for educational purposes, and comprehensive integration capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Components  │  Pages  │  Hooks  │  Utils  │  State Mgmt   │
│  - PaymentCard │ Dashboard │ useAuth │ API    │ TanStack     │
│  - Header      │ SendMoney │ useNot. │ Client │ Query        │
│  - Modals      │ External  │ Custom  │ Auth   │ Cache        │
└─────────────────────────────────────────────────────────────┘
                              │
                        HTTP/WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer (Express)                   │
├─────────────────────────────────────────────────────────────┤
│   Routes   │ Middleware │  Auth     │  Storage │   Services │
│   - API    │ - CORS     │ - Session │ - Memory │ - External │
│   - Auth   │ - Logging  │ - Local   │ - DB     │ - Juice    │
│   - Admin  │ - Error    │ - Validation │ Layer │ - Shop     │
└─────────────────────────────────────────────────────────────┘
                              │
                        Database Layer
                              │
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                          │
├─────────────────────────────────────────────────────────────┤
│   Tables   │  Relations │  Indexes  │   Views  │ Functions  │
│   - Users  │ - Foreign  │ - Primary │ - User   │ - Triggers │
│   - Trans. │   Keys     │ - Unique  │   Stats  │ - Stored   │
│   - Payments │ - Joins  │ - Search  │ - Audit  │   Procs    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Architecture

#### Core Framework
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with design system consistency

#### State Management
- **TanStack Query (React Query)** for server state management
  - Automatic background refetching
  - Optimistic updates
  - Cache invalidation strategies
  - Error boundary integration

#### Routing
- **Wouter** for lightweight client-side routing
  - Declarative route definitions
  - Nested route support
  - Programmatic navigation

#### UI Components
- **Shadcn/ui** component library built on Radix UI primitives
- **Lucide React** for consistent iconography
- **Custom components** for domain-specific functionality

### Backend Architecture

#### Core Framework
- **Express.js** with TypeScript for robust server-side development
- **Session-based authentication** using express-session
- **bcrypt** for secure password hashing

#### Database Layer
- **SQLite** as the primary database
- **Drizzle ORM** for type-safe database operations
- **Database migrations** handled through Drizzle Kit

#### Security (Intentionally Vulnerable)
- **OWASP Top 10** vulnerability implementations
- **API Security Top 10** demonstration patterns
- **Educational security annotations** throughout codebase

## Directory Structure

```
whoopspay/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (shadcn)
│   │   │   ├── payment-card.tsx
│   │   │   ├── header.tsx
│   │   │   └── modals/
│   │   ├── pages/             # Page-level components
│   │   │   ├── dashboard.tsx
│   │   │   ├── send-money.tsx
│   │   │   ├── ExternalPayment.tsx
│   │   │   └── administration.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useNotifications.ts
│   │   ├── lib/               # Utility libraries
│   │   │   ├── queryClient.ts
│   │   │   ├── authUtils.ts
│   │   │   └── i18n.ts
│   │   └── App.tsx            # Main application component
│   └── index.html
├── server/                     # Backend Express application
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Data access layer
│   ├── localAuth.ts           # Authentication middleware
│   ├── adminMiddleware.ts     # Admin authorization
│   ├── mockData.ts           # Demo data seeding
│   ├── db.ts                 # Database connection
│   └── index.ts              # Server entry point
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Drizzle database schema
└── docs/                      # Documentation files
    ├── README.md
    ├── ARCHITECTURE.md
    └── SECURITY_DOCUMENTATION.md
```

## Data Flow Architecture

### Authentication Flow
```
1. User submits credentials → Local Auth Middleware
2. Password verification with bcrypt → Session creation
3. Session storage in memory → User object attachment
4. Frontend receives user data → Global state update
5. Protected routes accessible → UI state synchronization
```

### Transaction Processing Flow
```
1. User initiates transaction → Form validation
2. Payment method selection → Balance verification
3. Recipient validation → Transaction creation
4. Database persistence → Notification generation
5. UI updates via cache invalidation → Real-time feedback
```

### External Payment Integration Flow
```
1. Juice Shop initiates payment → External API call
2. Transaction record creation → User authentication check
3. Payment approval interface → User decision capture
4. Status update and redirect → External callback
5. Transaction completion → Audit log creation
```

## Component Architecture

### Core Design Patterns

#### Container/Presentational Pattern
- **Container components** handle data fetching and business logic
- **Presentational components** focus on UI rendering and user interaction
- Clear separation enables better testing and reusability

#### Custom Hooks Pattern
- **useAuth** centralizes authentication state management
- **useNotifications** handles real-time notification updates
- **Custom data hooks** encapsulate API interaction logic

#### Provider Pattern
- **QueryClientProvider** manages global query state
- **I18nProvider** handles internationalization
- **TooltipProvider** enables consistent tooltip behavior

### Component Hierarchy

```
App
├── Router
│   ├── Landing (unauthenticated)
│   │   ├── Login
│   │   └── Signup
│   └── Dashboard (authenticated)
│       ├── Header
│       │   ├── NotificationsModal
│       │   └── UserDropdown
│       ├── MobileNav
│       ├── PaymentCard[]
│       ├── TransactionItem[]
│       └── Modals
│           ├── SendMoneyModal
│           ├── AddCardModal
│           └── AddBankModal
```

## Database Architecture

### Schema Design

#### Core Tables
```sql
-- Users table with authentication and profile data
users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR,  -- bcrypt hashed
  firstName VARCHAR,
  lastName VARCHAR,
  balance DECIMAL,
  isAdmin INTEGER,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Transactions for all money movements
transactions (
  id SERIAL PRIMARY KEY,
  fromUserId VARCHAR REFERENCES users(id),
  toUserId VARCHAR REFERENCES users(id),
  amount DECIMAL,
  description TEXT,
  status VARCHAR,
  type VARCHAR,
  externalOrderId VARCHAR,  -- For external integrations
  externalSource VARCHAR,   -- Source application name
  returnUrl VARCHAR,        -- Success redirect URL
  cancelUrl VARCHAR,        -- Cancel redirect URL
  createdAt TIMESTAMP
)

-- Payment methods for users
payment_methods (
  id SERIAL PRIMARY KEY,
  userId VARCHAR REFERENCES users(id),
  type VARCHAR,  -- 'card' or 'bank'
  cardNumber VARCHAR,
  cardName VARCHAR,
  bankName VARCHAR,
  accountNumber VARCHAR,
  iban VARCHAR,
  isDefault INTEGER,
  createdAt TIMESTAMP
)

-- Notifications for user alerts
notifications (
  id SERIAL PRIMARY KEY,
  userId VARCHAR REFERENCES users(id),
  title VARCHAR,
  message TEXT,
  type VARCHAR,
  isRead INTEGER DEFAULT 0,
  createdAt TIMESTAMP
)
```

#### Relationships
- **One-to-Many**: User → Transactions (as sender)
- **One-to-Many**: User → Transactions (as recipient)
- **One-to-Many**: User → Payment Methods
- **One-to-Many**: User → Notifications

#### Indexes
- Primary keys on all tables
- Unique index on users.email
- Composite indexes on transaction queries
- Foreign key indexes for join performance

## API Architecture

### RESTful Endpoint Design

#### Authentication Endpoints
```
POST /api/login          # User authentication
POST /api/logout         # Session termination
GET  /api/auth/user      # Current user info
POST /api/signup         # User registration
```

#### Transaction Endpoints
```
GET    /api/transactions           # User transaction history
POST   /api/transactions           # Create new transaction
GET    /api/transactions/:id       # Transaction details
PUT    /api/transactions/:id       # Update transaction status
DELETE /api/transactions/:id       # Cancel transaction
```

#### Payment Method Endpoints
```
GET    /api/payments               # User payment methods
POST   /api/payments               # Add payment method
DELETE /api/payments/:id           # Remove payment method
PUT    /api/payments/:id/default   # Set default method
```

#### External Integration Endpoints
```
POST /api/external/payment         # Create external payment
GET  /api/external/payment/:id     # External payment status
POST /api/external/payment/:id/approve  # Approve payment
POST /api/external/payment/:id/reject   # Reject payment
```

#### Administrative Endpoints
```
GET    /api/admin/users            # All users (admin only)
POST   /api/admin/users            # Create user (admin only)
DELETE /api/admin/users/:id        # Delete user (admin only)
GET    /api/admin/transactions     # All transactions (admin only)
GET    /api/admin/logs             # System logs (admin only)
```

### Security Vulnerabilities (Educational)

#### Implemented Vulnerabilities
- **A01 Broken Access Control**: Direct object references without authorization
- **A02 Cryptographic Failures**: Sensitive data in plain text responses
- **A03 Injection**: SQL injection in search functionality
- **A04 Insecure Design**: Missing rate limiting on critical operations
- **A05 Security Misconfiguration**: Verbose error messages exposing system info
- **A07 Authentication Failures**: Weak session management
- **A09 Logging Failures**: Insufficient audit logging for sensitive operations

## Integration Architecture

### Juice Shop Integration

#### Payment Flow Design
```
1. Juice Shop checkout → POST to WhoopsPay external API
2. External transaction creation → User authentication redirect
3. Payment approval interface → User decision capture
4. Status callback to Juice Shop → Transaction completion
5. Redirect back to Juice Shop → Order fulfillment
```

#### Authentication Bridge
- **Session sharing** between applications
- **Token-based** authentication for API calls
- **Redirect URLs** for seamless user experience
- **Error handling** for failed authentications

### External Service Integration Points

#### Future Integration Capabilities
- **PayPal** payment processing
- **Stripe** payment gateway
- **Bank API** connections
- **Third-party** e-commerce platforms
- **Mobile app** API endpoints

## Security Architecture (Educational Vulnerabilities)

### Vulnerability Categories

#### Access Control Issues
- **IDOR** in transaction endpoints
- **Privilege escalation** through parameter manipulation
- **Missing authorization** checks on sensitive operations

#### Data Exposure Issues
- **Excessive data** in API responses
- **Sensitive information** in error messages
- **Unprotected debug** endpoints

#### Input Validation Issues
- **SQL injection** in search parameters
- **XSS** in user-generated content
- **CSRF** token missing on state-changing operations

## Performance Architecture

### Frontend Optimization
- **Code splitting** with dynamic imports
- **Lazy loading** of non-critical components
- **Image optimization** with proper formats
- **Bundle analysis** for size optimization

### Backend Optimization
- **Connection pooling** for database efficiency
- **Query optimization** with proper indexes
- **Caching strategies** for frequent data
- **Compression** for API responses

### Database Optimization
- **Index strategy** for common query patterns
- **Query plan** analysis for performance
- **Connection management** for concurrent users
- **Backup strategies** for data protection

## Deployment Architecture

### Development Environment
- **Local SQLite** database
- **Node.js** development server
- **Hot module replacement** for fast development
- **Source maps** for debugging

### Production Considerations
- **Environment variables** for configuration
- **Process management** with PM2 or similar
- **Reverse proxy** configuration
- **SSL/TLS** certificate management
- **Database backup** and recovery procedures

## Testing Architecture

### Frontend Testing Strategy
- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for user workflows
- **E2E tests** with Playwright or Cypress

### Backend Testing Strategy
- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **Database tests** for data integrity
- **Security tests** for vulnerability validation

### Testing Tools
- **Jest** for unit and integration testing
- **React Testing Library** for component testing
- **Supertest** for API endpoint testing
- **Security scanners** for vulnerability verification

## Monitoring and Observability

### Logging Strategy
- **Structured logging** with consistent format
- **Error tracking** with stack traces
- **Performance metrics** for optimization
- **Security events** for audit trails

### Monitoring Tools
- **Application metrics** for performance tracking
- **Database monitoring** for query performance
- **Error reporting** for issue detection
- **User analytics** for behavior insights

This architecture supports the educational goals of WhoopsPay while providing a realistic foundation for security training and vulnerability demonstration.