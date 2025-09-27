# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The platform serves as a comprehensive hands-on learning environment for security professionals, developers, students, and penetration testers to practice identifying and exploiting security flaws in a controlled setting.

The application provides full-featured financial capabilities including user authentication, digital wallet management, money transfers, transaction history, payment methods, external payment processing, and administrative features. It integrates with OWASP Juice Shop for cross-platform payment scenarios and includes a 4-phase automated security testing pipeline for educational analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing with authentication guards
- **State Management**: React Query for server state management combined with React hooks for local state
- **UI Components**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Internationalization**: Custom i18n system supporting English and Greek locales
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js 20+ with Express.js framework for API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication using express-session with intentional vulnerabilities
- **API Design**: RESTful API with Swagger documentation exposed for educational purposes
- **Security Testing**: 4-phase pipeline including ESLint security linting, SAST with Snyk, SCA dependency scanning, and DAST with OWASP ZAP

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries
- **Schema**: Intentionally vulnerable design with plain text password storage, unencrypted sensitive data (SSN, bank accounts), and missing proper foreign key constraints
- **Session Storage**: Database-backed session storage with insufficient encryption
- **Migration System**: Drizzle Kit for schema management and database migrations

### Security Architecture (Intentionally Vulnerable)
- **Authentication**: Session-based with weak session secrets and missing multi-factor authentication
- **Authorization**: Basic role-based access control with IDOR vulnerabilities and insufficient privilege validation
- **Data Protection**: Intentional plain text storage of sensitive information for educational exploitation
- **Input Validation**: Missing or insufficient validation to demonstrate injection vulnerabilities
- **Logging**: Insufficient audit logging and monitoring for security events

### Development Environment
- **Monorepo Structure**: Single repository with integrated frontend and backend
- **Hot Reload**: Vite development server with automatic refresh on code changes
- **Database**: Local PostgreSQL with SQLite fallback for development simplicity
- **Port Configuration**: Single port (5000) serving both frontend and API endpoints

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL as primary database with Drizzle ORM for type-safe operations
- **Authentication**: express-session for server-side session management with bcrypt for password hashing
- **Payment Integration**: PayPal Server SDK for external payment processing and cross-platform transactions
- **UI Framework**: Radix UI primitives with shadcn/ui component library for accessible UI components

### Security Testing Tools
- **SAST**: Snyk Code with DeepCode AI engine for static application security testing
- **SCA**: Snyk Open Source for software composition analysis and dependency vulnerability scanning
- **DAST**: OWASP ZAP for dynamic application security testing and penetration testing
- **Linting**: ESLint with security plugins including eslint-plugin-security and Microsoft SDL

### Development Tools
- **Build System**: Vite for fast development builds and optimized production bundling
- **TypeScript**: Full TypeScript support across frontend and backend for type safety
- **Styling**: Tailwind CSS with PostCSS for utility-first styling and responsive design
- **API Documentation**: Swagger/OpenAPI with swagger-jsdoc and swagger-ui-express

### External Services
- **OWASP Juice Shop**: Integration for cross-platform payment scenarios and educational security testing
- **PayPal Sandbox**: External payment processing for realistic financial transaction simulation
- **CI/CD Pipeline**: GitHub Actions workflow for automated security testing and vulnerability assessment

### Educational Security Features
- **Vulnerability Database**: Intentional implementation of OWASP Top 10 and API Security vulnerabilities
- **Security Reports**: Comprehensive reporting with HTML output for vulnerability analysis
- **Penetration Testing**: Automated security testing with evidence collection and exploitation examples