# WhoopsPay Development Guide

## 🔧 Development Environment Setup

### **Local Development**

WhoopsPay is designed to run seamlessly in local development environments with hot reload and integrated debugging.

#### **System Requirements**
- **Node.js 20+** (LTS recommended)
- **npm** (comes with Node.js)
- **Git** for version control

#### **Initial Setup**
```bash
# Clone and enter project directory
git clone <repository-url>
cd whoopspay

# Install all dependencies
npm install

# Initialize SQLite database with schema and mock data
npm run db:push

# Start development server (with hot reload)
npm run dev
```

#### **Development Server Details**
- **URL**: http://localhost:5000
- **Port**: 5000 (both frontend and backend)
- **Hot Reload**: Automatic refresh on code changes
- **Database**: SQLite file at `data/whoopspay.db`
- **API Docs**: http://localhost:5000/api-docs

### **Architecture Overview**
WhoopsPay uses a **monorepo architecture** with integrated frontend and backend:
```
localhost:5000 → Vite Dev Server → Express API → SQLite Database
```

## 🏗️ **Project Structure**

```
whoopspay/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn/ui)
│   │   ├── pages/         # Route components (wouter routing)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── main.tsx       # React application entry point
│   └── index.html         # HTML template
├── server/                # Express backend application  
│   ├── controllers/       # Business logic (auth, transactions, etc.)
│   ├── middleware/        # Express middleware (auth, logging)
│   ├── routes/           # API route definitions
│   ├── modules/          # Feature modules (Juice Shop integration)
│   ├── config.ts         # Environment configuration
│   ├── index.ts          # Express server entry point
│   └── vite.ts           # Vite development integration
├── shared/               # Shared types and database schema
│   └── schema.ts         # Drizzle ORM SQLite schema
├── data/                 # SQLite database storage
│   └── whoopspay.db      # Main application database
├── .github/workflows/    # CI/CD security pipeline
└── attached_assets/      # Static files and security reports
```

## 💻 **Development Workflow**

### **Daily Development Process**

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Launches Express server with Vite integration
   - Enables hot module replacement (HMR)
   - Serves both frontend and API on port 5000

2. **Database Operations**
   ```bash
   # Update database schema after changes
   npm run db:push
   
   # Force update if conflicts
   npm run db:push --force
   ```

3. **Code Quality Checks**
   ```bash
   # TypeScript type checking
   npm run check
   ```

### **Key Development Features**

#### **Hot Reload System**
- **Frontend**: Instant React component updates via Vite HMR
- **Backend**: Automatic server restart on Express route changes
- **Database**: Schema changes reflected immediately after `db:push`

#### **Integrated Development**
- **Single Port**: No CORS issues, frontend and backend on localhost:5000
- **Shared Types**: TypeScript interfaces shared between client and server
- **Unified Routing**: Client-side routing with server-side API fallback

## 🗄️ **Database Development**

### **SQLite Configuration**
- **Database File**: `data/whoopspay.db` (committed to repository)
- **ORM**: Drizzle ORM with better-sqlite3 driver
- **Schema Location**: `shared/schema.ts`

### **Database Schema Management**
```bash
# Apply schema changes to database
npm run db:push

# Force push (if schema conflicts occur)
npm run db:push --force
```

### **Mock Data**
The application includes comprehensive mock data for testing:
- **Admin User**: Pre-created for testing admin features
- **Regular Users**: Multiple test accounts with various access levels
- **Transactions**: Sample financial data across different categories
- **Payment Methods**: Test credit cards and bank accounts

### **Database Vulnerabilities (Educational)**
The schema intentionally includes security flaws:
- Plain text sensitive data storage
- Missing foreign key constraints
- Excessive data exposure
- Weak encryption practices

## 🔌 **API Development**

### **API Structure**
```
/api/
├── auth/                  # Authentication endpoints
├── users/                 # User management
├── transactions/          # Financial operations
├── payment-methods/       # Credit cards & bank accounts
├── money-requests/        # Cross-user payments
├── notifications/         # User messaging
├── admin/                 # Administrative functions
└── external/              # Third-party integrations
```

### **API Documentation**
- **Swagger UI**: http://localhost:5000/api-docs
- **OpenAPI Spec**: Auto-generated from code annotations
- **Interactive Testing**: Built-in API explorer

### **Authentication in Development**
- **Session-based**: Uses express-session with SQLite storage
- **Admin Access**: Check console output for admin credentials
- **Cookie Management**: Automatic session handling

## 🎨 **Frontend Development**

### **Technology Stack**
- **React 18**: Component-based UI development
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **TanStack Query**: Data fetching and caching
- **Wouter**: Lightweight routing

### **Component Development**
```typescript
// Example component with proper typing
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function TransactionList() {
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  return (
    <div className="space-y-4">
      {transactions?.map(tx => (
        <div key={tx.id} className="border rounded p-4">
          {/* Component content */}
        </div>
      ))}
    </div>
  );
}
```

### **Styling Development**
- **Tailwind Config**: Customized for WhoopsPay branding
- **Dark Mode**: Built-in theme switching
- **Component Library**: shadcn/ui for consistent design
- **Responsive Design**: Mobile-first approach

## 🔍 **Debugging & Testing**

### **Development Debugging**
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Check application logs
# Server logs appear in terminal
# Client logs appear in browser console
```

### **Database Debugging**
```bash
# SQLite CLI access
sqlite3 data/whoopspay.db

# View tables
.tables

# Query examples
SELECT * FROM users LIMIT 5;
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

### **API Testing**
- **Swagger UI**: http://localhost:5000/api-docs for interactive testing
- **curl Examples**: 
  ```bash
  # Test authentication
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@whoopspay.com","password":"admin123"}'
  
  # Test transactions (with session)
  curl -X GET http://localhost:5000/api/transactions \
    -H "Cookie: connect.sid=your-session-id"
  ```

## 🔒 **Security Testing in Development**

### **Local Security Pipeline**
The same security tools used in CI/CD can be run locally:

```bash
# ESLint security linting
npx eslint . --ext .js,.ts,.tsx

# Manual vulnerability testing
# Use the intentional vulnerabilities for learning:
# - Try accessing other users' data
# - Test input validation bypasses
# - Explore authorization weaknesses
```

### **Intentional Vulnerabilities for Testing**
- **SQL Injection**: Try malicious inputs in transaction queries
- **XSS**: Test script injection in user inputs  
- **IDOR**: Access other users' data with direct object references
- **Auth Bypass**: Explore session and authentication weaknesses

## 🚀 **Production Preparation**

### **Build Process**
```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

### **Production Differences**
- **Static Files**: Vite builds optimized frontend bundle
- **Server Mode**: Express serves pre-built files instead of Vite middleware
- **Database**: Same SQLite file, but production-optimized
- **Logging**: Production logging format

## 🛠️ **Development Tools**

### **IDE Setup**
Recommended VS Code extensions:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- SQLite Viewer

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### **Environment Variables**
Create `.env.local` for local overrides:
```bash
# Optional local development overrides
NODE_ENV=development
DEBUG=express:*
VITE_API_URL=http://localhost:5000
```

## 📊 **Performance Monitoring**

### **Development Metrics**
- **Vite HMR**: Sub-second hot reload times
- **SQLite Performance**: Local file-based database for fast queries
- **Memory Usage**: Monitor with Node.js built-in tools

### **Production Readiness**
```bash
# Build size analysis
npm run build -- --analyze

# Production performance test
npm run start
# Test with production data loads
```

This development guide provides everything needed to productively work with WhoopsPay's codebase while understanding its educational security features.