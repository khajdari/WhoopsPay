# WhoopsPay - MVC Architecture Structure

**⚠️ WARNING: This application contains intentional security vulnerabilities for educational purposes. NEVER use this code in production environments!**

## Secure SDLC Pipeline

WhoopsPay includes a comprehensive security pipeline implemented in `.github/workflows/ssdlc-pipeline.yml`:

### Pipeline Phases
1. **ESLint Security Linting** - Code quality and security rule enforcement
2. **SAST (Snyk Code)** - Static application security testing with maximum depth
3. **SCA (Snyk)** - Software composition analysis with dependency vulnerability scanning  
4. **DAST (OWASP ZAP)** - Dynamic application security testing with penetration testing

### Security Tools Integration
- **ESLint Plugins**: eslint-plugin-security, @microsoft/eslint-plugin-sdl, eslint-plugin-sonarjs
- **Snyk Code**: DeepCode AI engine with cross-file analysis and maximum sensitivity configuration
- **Snyk Open Source**: Comprehensive dependency scanning with development dependencies included
- **OWASP ZAP**: Automated dynamic security testing with full application coverage

### Pipeline Triggers
- **Pull Requests**: Automatically runs on pull requests to `develop-vulnerable` branch
- **Semantic Versioning**: Synchronized version management across reports and Docker images
- **GitHub Issues**: Automated security report issues with download-only access
- **Artifact Storage**: All security reports preserved as GitHub Actions artifacts

## Project Organization

### Backend Structure (MVC Pattern)

```
server/
├── controllers/           # Request handlers and business logic coordination
│   ├── AuthController.ts         # Authentication and user sessions
│   ├── UserController.ts         # User profile and account management
│   ├── TransactionController.ts  # Transaction processing and management
│   ├── MoneyRequestController.ts # External payment request handling
│   ├── NotificationController.ts # User notifications
│   └── AdminController.ts        # Administrative functions
├── middleware/           # Express middleware
│   └── adminMiddleware.ts        # Admin authorization and logging
├── modules/             # External service integrations
│   └── juice-shop/              # OWASP Juice Shop integration
│       ├── index.ts             # Module exports and routes
│       └── JuiceShopController.ts # Juice Shop payment processing
├── routes/              # Route definitions
│   └── index.ts                 # Main route configuration (MVC)
├── services/            # Business logic layer (prepared for expansion)
├── utils/               # Utility functions
│   └── urlAdapter.ts            # Dynamic URL adaptation
├── config.ts            # Configuration management
├── storage.ts           # Database abstraction layer
├── db.ts               # Database connection
├── index.ts            # Server entry point
└── vite.ts             # Vite development server integration
```

### Frontend Structure

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Application pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/           # Utility libraries
│   └── App.tsx        # Main application component
└── index.html         # HTML entry point
```

### Shared Resources

```
shared/
└── schema.ts          # Database schema definitions (Drizzle ORM)
```

## Controller Responsibilities

### AuthController
- User login/logout
- Session management
- Authentication validation
- **Vulnerabilities**: Basic authentication without rate limiting, plain text password support

### UserController  
- User profile management
- Account information retrieval
- Test account access
- **Vulnerabilities**: Direct object references, no authorization checks

### TransactionController
- Transaction creation and processing
- Balance updates
- Transaction approval/rejection
- **Vulnerabilities**: No authentication checks, insufficient validation

### MoneyRequestController
- External payment request handling
- Request approval/rejection workflow
- Integration with external services
- **Vulnerabilities**: No authorization checks, anyone can approve requests

### NotificationController
- User notification management
- Notification creation and deletion
- Read status management
- **Vulnerabilities**: No ownership validation

### AdminController
- Administrative user management
- System statistics
- Bulk operations
- **Vulnerabilities**: Weak admin verification, no audit trails

## Module Structure

### Juice Shop Module
- **Location**: `server/modules/juice-shop/`
- **Purpose**: External e-commerce integration simulation
- **Components**:
  - Product catalog simulation
  - Order creation and management
  - Payment request integration with WhoopsPay
- **Vulnerabilities**: No authentication, direct object references

## Key Features

### URL Adapter System
- **Location**: `server/utils/urlAdapter.ts`
- **Purpose**: Dynamic URL adaptation for different environments
- **Functionality**: 
  - Adapts localhost URLs to current domain
  - Supports localhost, Replit, and production environments
  - Ensures external payment redirects work correctly

### MVC Route Organization
- **Location**: `server/routes/index.ts`
- **Structure**: Organized by functionality with controller delegation
- **Benefits**: 
  - Clear separation of concerns
  - Easy maintenance and testing
  - Scalable architecture
  - Proper error handling

## Educational Security Vulnerabilities

Each controller intentionally implements OWASP Top 10 vulnerabilities:

1. **Broken Access Control**: Direct object references, privilege escalation
2. **Cryptographic Failures**: Plain text data storage  
3. **Injection**: Insufficient input validation
4. **Insecure Design**: Missing rate limiting, weak validation
5. **Security Misconfiguration**: Verbose error messages
6. **Broken Authentication**: Weak session management
7. **Logging Failures**: Insufficient security logging

## Development Guidelines

### Adding New Controllers
1. Create controller in `server/controllers/`
2. Implement static methods for each endpoint
3. Add routes in `server/routes/index.ts`
4. Include intentional vulnerabilities for educational purposes
5. Document vulnerabilities in code comments

### Adding New Modules
1. Create module directory in `server/modules/`
2. Create index.ts with route exports
3. Implement controller with business logic
4. Register routes in main routes file
5. Update this documentation

## Security Training Notes

This codebase is designed for educational purposes and contains intentional security vulnerabilities. 

**⚠️ WARNING: Never use this code in production environments!**

The vulnerabilities are clearly marked in code comments and serve as learning examples for:
- Security professionals
- Developers learning secure coding
- Penetration testing students
- Cybersecurity training programs