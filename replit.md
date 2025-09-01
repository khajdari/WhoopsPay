# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an educational cybersecurity training platform that simulates a comprehensive financial payment system while intentionally implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The platform is designed for security professionals, developers, students, and penetration testers to learn about web application vulnerabilities, secure coding practices, and vulnerability assessment in a controlled environment.

The application provides a realistic financial management interface with features including user authentication, money transfers, transaction history, payment methods management, and administrative controls - all while demonstrating common security flaws for educational purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture (MVC Pattern)
The backend follows a Model-View-Controller pattern with clear separation of concerns:

- **Controllers**: Handle request processing and business logic coordination for authentication, user management, transactions, money requests, notifications, and administration
- **Models**: Data layer abstraction using Drizzle ORM with SQLite for development and PostgreSQL support for production
- **Routes**: RESTful API endpoints with comprehensive routing configuration organized under `/api` prefix
- **Middleware**: Express middleware for authentication, authorization, and admin access control
- **Services**: Business logic layer prepared for expansion and external integrations

### Frontend Architecture (React + TypeScript)
The frontend uses modern React patterns with comprehensive component architecture:

- **Component-based UI**: Reusable components using shadcn/ui design system with Tailwind CSS
- **State Management**: React Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing with authentication-based route protection
- **Internationalization**: Custom i18n system supporting English and Greek locales
- **Authentication**: Session-based authentication with persistent state management

### Database Design
SQLite-based development database with intentionally vulnerable schema design:

- **Users Table**: Contains deliberately exposed sensitive data (SSN, plain text passwords for some users)
- **Transactions Table**: Financial transaction records with minimal validation
- **Payment Methods**: Credit card and bank account storage with weak encryption
- **Sessions**: Express session storage with vulnerable configuration
- **Notifications**: Real-time notification system for transaction updates
- **Money Requests**: Cross-user payment request system with approval workflows

### Security Pipeline Integration
Comprehensive Secure SDLC pipeline with 4-phase security analysis:

- **Phase 1**: ESLint Security Linting with enterprise-grade security plugins
- **Phase 2**: Snyk Code SAST with maximum depth static analysis
- **Phase 3**: Snyk SCA with comprehensive dependency vulnerability scanning
- **Phase 4**: OWASP ZAP DAST with dynamic penetration testing
- **Integration**: Automated GitHub Issues, semantic versioning, and Docker Hub deployment

### Educational Vulnerability Framework
Intentionally implements security vulnerabilities for training purposes:

- **OWASP Top 10 2021**: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Authentication Failures, Security Logging Failures
- **OWASP API Security Top 10**: Broken Object Level Authorization, Broken User Authentication, Excessive Data Exposure, Unrestricted Resource Consumption, Broken Function Level Authorization

## External Dependencies

### Core Framework Dependencies
- **Express.js**: Backend web application framework with session management
- **React 18**: Frontend UI library with TypeScript support
- **Drizzle ORM**: Type-safe database ORM with SQLite/PostgreSQL support
- **Better SQLite3**: High-performance SQLite database driver for development

### UI and Styling Dependencies
- **shadcn/ui**: Modern component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Lucide React**: Icon library with comprehensive financial and UI icons

### State Management and Data Fetching
- **TanStack React Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight client-side routing library
- **React Hook Form**: Form state management with validation

### Authentication and Security
- **Express Session**: Session-based authentication with SQLite storage
- **bcrypt**: Password hashing library for user authentication
- **CORS**: Cross-origin resource sharing middleware

### Security Testing and Analysis
- **ESLint**: Code quality and security linting with security-focused plugins
- **Snyk**: Static application security testing and dependency scanning
- **OWASP ZAP**: Dynamic application security testing and penetration testing
- **Security Plugins**: eslint-plugin-security, @microsoft/eslint-plugin-sdl, eslint-plugin-sonarjs

### Build and Development Tools
- **Vite**: Modern build tool with hot module replacement
- **TypeScript**: Type-safe JavaScript with enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds

### External Service Integrations
- **OWASP Juice Shop**: Integrated vulnerable web application for cross-platform payment simulation
- **PayPal SDK**: Payment processing integration for external payment flows
- **Docker**: Containerization for consistent deployment environments

### Documentation and API Tools
- **Swagger**: API documentation generation and interactive testing interface
- **GitHub Actions**: CI/CD pipeline for automated security testing and deployment