# WhoopsPay Local Development Setup

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for cloning)

## Installation & Setup

### 1. Clone or Download the Project
```bash
git clone <repository-url>
cd whoopspay
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration (Optional - uses in-memory storage by default)
DATABASE_URL=sqlite:./data/whoopspay.db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration (for local development)
CORS_ORIGIN=http://localhost:5000
```

### 4. Start the Application
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The application will be available at: `http://localhost:5000`

## Default Test Accounts

The application comes with pre-configured test accounts for security testing:

### Regular User Account
- **Username**: `jdoe`
- **Password**: `password123`
- **Email**: `john.doe@example.com`
- **Balance**: $2,500.75

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`
- **Balance**: $10,000.00

## Features Available

### 1. Authentication System
- Local login/logout functionality
- User registration
- Session management
- Password hashing (bcrypt)

### 2. Payment Management
- Send/receive money
- Transaction history
- Payment method management (cards, bank accounts)
- Balance tracking

### 3. Security Testing Features
- **Intentional vulnerabilities** for educational purposes
- OWASP Top 10 demonstrations
- API security testing endpoints
- Admin panel with logs

### 4. API Documentation
- Swagger UI available at: `http://localhost:5000/api-docs`
- Complete API reference with examples
- Interactive testing interface

## Project Structure

```
whoopspay/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # React hooks
│   │   └── lib/            # Utilities
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   ├── localAuth.ts        # Authentication system
│   └── adminMiddleware.ts  # Admin functionality
├── shared/                 # Shared types and schemas
└── docs/                   # Documentation
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Generate PNG logo
node generate-logo.js

# Run type checking
npm run type-check
```

## Security Considerations

⚠️ **WARNING**: This application contains intentional security vulnerabilities for educational purposes.

### Educational Vulnerabilities Include:
- SQL injection possibilities
- Cross-site scripting (XSS) vectors
- Broken access control
- Insecure data storage
- Weak authentication mechanisms
- Information disclosure

### Production Security (If Modified):
If you modify this for production use:
1. Remove all intentional vulnerabilities
2. Implement proper input validation
3. Use HTTPS in production
4. Configure secure session cookies
5. Add rate limiting
6. Implement proper logging
7. Use environment variables for secrets

## Troubleshooting

### Port Already in Use
If port 5000 is in use, modify the PORT in `.env` file:
```env
PORT=3001
```

### Module Not Found Errors
Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Session Issues
Clear browser cookies and restart the server if experiencing authentication issues.

## Integration with OWASP Juice Shop

The application includes integration endpoints for OWASP Juice Shop checkout:

1. Copy `whoopspay-logo.png` to Juice Shop's `assets/public/images/` folder
2. Configure Juice Shop to use WhoopsPay payment endpoints
3. See `JUICE_SHOP_INTEGRATION.md` for detailed integration steps

## Support

For issues related to the security testing features or vulnerability demonstrations, refer to:
- `SECURITY_DOCUMENTATION.md` - Detailed vulnerability explanations
- `JUICE_SHOP_INTEGRATION.md` - Cross-platform integration guide
- API documentation at `/api-docs` when server is running