# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The platform serves as a comprehensive hands-on learning environment for security professionals, developers, and students studying application security.

The application includes full-featured financial capabilities such as user authentication, digital wallet systems, money transfers, transaction history, payment methods, and cross-platform integration with OWASP Juice Shop. It also features administrative dashboards, user management, and real-time notification systems, all built with intentional security flaws for educational purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **State Management**: React Query for server state management combined with React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom i18n implementation supporting English and Greek locales
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API server development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with express-session
- **Password Security**: bcrypt for password hashing (with intentional vulnerabilities)
- **API Documentation**: Swagger/OpenAPI integration for endpoint documentation

### Monorepo Structure
The project uses a monorepo architecture with clear separation of concerns:
- `/client` - React frontend application with components, pages, and hooks
- `/server` - Express backend with controllers, middleware, and routes
- `/shared` - Shared TypeScript schemas and types using Drizzle ORM
- Security pipeline configuration in `.github/workflows`

### Security Training Features
The application implements a comprehensive 4-phase security testing pipeline:
1. **ESLint Security Linting** - Static code analysis with security-focused plugins
2. **SAST** - Static Application Security Testing using Snyk Code
3. **SCA** - Software Composition Analysis for dependency vulnerabilities
4. **DAST** - Dynamic Application Security Testing with OWASP ZAP

### Intentional Vulnerabilities
Educational security flaws include:
- **OWASP A01**: Broken Access Control through IDOR vulnerabilities and missing authorization
- **OWASP A02**: Cryptographic Failures with mixed plain text and encrypted data storage
- **OWASP A03**: Injection vulnerabilities through unvalidated input processing
- **OWASP A07**: Authentication Failures with weak session management
- **API Security**: Broken object-level authorization and excessive data exposure

## External Dependencies

### Core Development Stack
- **Node.js 20+** - Runtime environment with npm package management
- **PostgreSQL** - Primary database for persistent data storage
- **Drizzle ORM** - Type-safe database toolkit and query builder

### Payment Integration
- **PayPal Server SDK** - External payment processing integration
- Cross-platform payment handling for OWASP Juice Shop integration

### Security and Analysis Tools
- **ESLint Security Plugins** - Multiple security-focused linting tools including Microsoft SDL
- **Snyk** - Vulnerability scanning for both source code (SAST) and dependencies (SCA)
- **OWASP ZAP** - Dynamic application security testing and penetration testing

### UI and Frontend Libraries
- **Radix UI** - Comprehensive component library for accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Query** - Server state management and caching
- **React Hook Form** - Form handling with validation

### Development and Build Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Type safety across the entire application
- **ESBuild** - Fast JavaScript bundler for production builds

### Infrastructure and Deployment
- **Docker** - Containerization support with multi-stage builds
- **GitHub Actions** - CI/CD pipeline for automated security testing
- **Express Rate Limiting** - Basic API protection (with intentional gaps)

### Educational Context
All external dependencies are selected to create realistic vulnerabilities while maintaining a functional payment application. The system intentionally lacks proper security configurations in areas like CORS, rate limiting, and authentication to provide comprehensive security training scenarios.