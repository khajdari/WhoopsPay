# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10, serving as a comprehensive hands-on learning platform for security professionals, developers, and students.

The application provides core financial features including user authentication, digital wallet management, money transfers, transaction history, payment methods, and cross-platform integration with OWASP Juice Shop. It includes administrative features for user management, transaction monitoring, and security reporting, all implemented with intentional security flaws for educational purposes.

**CRITICAL WARNING: This application contains intentional security vulnerabilities and should NEVER be deployed in production environments or used with real financial data.**

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with authentication-based route protection
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **State Management**: React Query for server state management with React hooks for local state
- **Internationalization**: Custom i18n system supporting English (UK) and Greek (Greece) locales
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js 20+ with Express.js web framework
- **Language**: TypeScript for type safety across the full stack
- **Database**: SQLite for local development with Drizzle ORM for type-safe database operations
- **Authentication**: Express sessions with bcrypt for password hashing (intentionally mixed with plain text for vulnerabilities)
- **Middleware**: Custom security middleware with intentional gaps for educational purposes
- **API Design**: RESTful API with comprehensive vulnerability demonstrations

### Database Design
- **ORM**: Drizzle ORM with SQLite dialect for reliable local development
- **Schema**: Comprehensive financial application schema including users, transactions, payment methods, notifications, and issue reports
- **Vulnerabilities**: Intentional plain text storage of sensitive data, missing constraints, and excessive data exposure for educational purposes
- **Sessions**: Database-stored sessions with intentional security weaknesses

### Security Training Features
- **4-Phase Security Pipeline**: ESLint security linting, SAST with Snyk Code, SCA with dependency scanning, and DAST with OWASP ZAP
- **OWASP Top 10 Vulnerabilities**: Comprehensive implementation of all major vulnerability categories including broken access control, cryptographic failures, injection, and insecure design
- **API Security Vulnerabilities**: Complete coverage of OWASP API Security Top 10 including broken object level authorization and unrestricted resource consumption

### Development Environment
- **Monorepo Structure**: Integrated frontend and backend in single repository with shared types
- **Hot Reload**: Vite development server with automatic refresh and integrated debugging
- **Database Management**: SQLite file-based storage with schema migrations and mock data seeding
- **Build Process**: Multi-stage Docker builds for production deployment with optimized images

## External Dependencies

### Core Runtime Dependencies
- **Node.js 20+**: Primary runtime environment with ES modules support
- **Express.js**: Web application framework for API server
- **React 18**: Frontend framework with TypeScript integration
- **Vite**: Build tool and development server for fast iteration

### Database and ORM
- **better-sqlite3**: SQLite database driver for Node.js
- **Drizzle ORM**: Type-safe ORM with SQLite dialect for database operations
- **drizzle-kit**: Migration tools and database management utilities

### Authentication and Security
- **express-session**: Session management with database storage
- **bcrypt**: Password hashing library (mixed with plain text for vulnerabilities)
- **express-session sqlite store**: Session persistence in SQLite database

### UI and Styling
- **@radix-ui**: Comprehensive component library for accessible UI primitives
- **shadcn/ui**: Pre-built component system built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation and performance optimization
- **@hookform/resolvers**: Validation resolvers for form schemas

### External Payment Integration
- **@paypal/paypal-server-sdk**: PayPal payment processing integration
- **OWASP Juice Shop**: Cross-platform payment integration for educational scenarios

### Security Testing Tools
- **ESLint Security Plugins**: Static analysis for security hotspot detection
- **Snyk**: SAST and SCA scanning for vulnerability assessment
- **OWASP ZAP**: Dynamic application security testing for runtime vulnerability detection

### Development and Build Tools
- **TypeScript**: Type system for JavaScript with strict configuration
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds
- **Docker**: Containerization for consistent deployment environments

### Documentation and API Tools
- **swagger-jsdoc**: API documentation generation from JSDoc comments
- **swagger-ui-express**: Interactive API documentation interface