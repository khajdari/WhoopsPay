# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The application serves as a comprehensive hands-on learning platform for security professionals, developers, and students studying application security.

The platform features a full-stack financial application with user authentication, digital wallet system, money transfers, transaction history, payment methods, external payment processing, and cross-platform integration with OWASP Juice Shop. It includes administrative features for user management, transaction monitoring, and security reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query for server state management combined with React hooks for local state
- **Routing**: Wouter library for client-side routing
- **Internationalization**: Custom i18n system supporting English (UK) and Greek (Greece)
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for robust API development
- **Authentication**: Session-based authentication with intentionally vulnerable implementations
- **Middleware**: Custom security middleware with educational vulnerabilities
- **Controllers**: MVC pattern with separate controllers for different business domains
- **API Documentation**: Swagger/OpenAPI integration for comprehensive API documentation

### Data Storage Solutions
- **Database**: PostgreSQL in production with Drizzle ORM for type-safe database operations
- **Development Database**: SQLite for local development with seamless PostgreSQL migration
- **Schema Management**: Drizzle migrations for version control of database changes
- **Session Storage**: Database-backed session management for user authentication

### Authentication and Authorization
- **Session Management**: Express-session with configurable storage backends
- **Password Storage**: bcrypt hashing with intentionally mixed implementations for education
- **Admin Authorization**: Role-based access control with intentional privilege escalation vulnerabilities
- **External Authentication**: Integration patterns for third-party authentication systems

### Security Testing Pipeline
Four-phase comprehensive security analysis:
1. **ESLint Security Linting**: Static code analysis with security-focused plugins
2. **SAST (Static Application Security Testing)**: Snyk Code analysis for vulnerability detection
3. **SCA (Software Composition Analysis)**: Dependency vulnerability scanning
4. **DAST (Dynamic Application Security Testing)**: OWASP ZAP automated penetration testing

### Educational Vulnerability Framework
The application intentionally implements OWASP Top 10 vulnerabilities including:
- A01: Broken Access Control with IDOR and insufficient authorization
- A02: Cryptographic Failures through weak password storage and session secrets
- A03: Injection vulnerabilities in SQL queries and parameter handling
- A04: Insecure Design with missing business logic validation
- A07: Authentication Failures through weak session management
- A09: Security Logging failures with insufficient audit trails

## External Dependencies

### Core Framework Dependencies
- **@paypal/paypal-server-sdk**: PayPal integration for external payment processing
- **@radix-ui**: Complete component library for accessible UI elements
- **@tanstack/react-query**: Server state management and caching
- **bcrypt**: Password hashing and validation

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **Drizzle Kit**: Database migration and schema management
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development

### Security Analysis Tools
- **eslint-plugin-security**: Security-focused linting rules
- **@microsoft/eslint-plugin-sdl**: Microsoft Security Development Lifecycle rules
- **eslint-plugin-sonarjs**: Code quality and vulnerability detection
- **swagger-jsdoc & swagger-ui-express**: API documentation generation

### Database and ORM
- **drizzle-orm**: Type-safe SQL query builder with PostgreSQL support
- **better-sqlite3**: SQLite database driver for development environment
- **Database migrations**: Automated schema versioning and deployment

### Authentication and Session Management
- **express-session**: Session middleware with configurable storage
- **cors**: Cross-origin resource sharing configuration
- **Session storage**: Database-backed persistent sessions

### Deployment and Infrastructure
- **Docker**: Containerization with multi-stage builds for production deployment
- **GitHub Actions**: CI/CD pipeline with automated security scanning
- **Render**: Cloud deployment platform integration
- **Environment configuration**: Flexible configuration management for different environments