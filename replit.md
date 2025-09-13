# WhoopsPay - OWASP Security Training Platform

## Overview

WhoopsPay is an educational cybersecurity training platform designed to demonstrate OWASP Top 10 vulnerabilities and API security weaknesses in a realistic payment application environment. The platform simulates a comprehensive payment system with intentional security flaws for educational purposes, including integration with OWASP Juice Shop for cross-platform payment scenarios.

The application serves as a hands-on learning environment where security professionals can explore common vulnerabilities in payment systems, practice penetration testing techniques, and understand secure coding practices through practical examples.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React 18 and TypeScript, using Vite for development tooling and build optimization. The frontend employs a modern component-based architecture with:

- **Component Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS for utility-first styling with a custom design system based on PayPal's visual identity
- **State Management**: React Query (TanStack Query) for server state management and caching, with React hooks for local component state
- **Routing**: Wouter for lightweight client-side routing with authentication-based route protection
- **Internationalization**: Custom i18n system supporting English and Greek locales with dynamic language switching

### Backend Architecture
The server-side application uses Express.js with TypeScript in an ESM module environment. The architecture follows a controller-based pattern with:

- **API Structure**: RESTful endpoints organized by domain (auth, users, transactions, admin) with intentionally vulnerable implementations
- **Authentication**: Session-based authentication using express-session with SQLite storage and bcrypt for password hashing (with intentional security weaknesses)
- **Middleware**: Custom middleware for authentication, admin authorization, and request logging with security vulnerabilities for educational purposes
- **Database Layer**: Drizzle ORM with SQLite for development and PostgreSQL configuration for production environments

### Data Storage Solutions
The application uses a dual database approach:

- **Development**: SQLite with better-sqlite3 for local development and testing, stored in a local `data/whoopspay.db` file
- **Production**: PostgreSQL configuration via Drizzle ORM with connection string support
- **Session Storage**: Database-backed session storage using express-session with SQLite tables
- **Schema Management**: Drizzle Kit for database migrations and schema versioning

### Authentication and Authorization
The authentication system implements session-based security with intentional vulnerabilities:

- **Session Management**: Express-session with database storage and configurable session secrets (with weak default values for training)
- **Password Storage**: Mixed implementation using bcrypt hashing alongside plain text storage for educational vulnerability demonstration
- **Authorization**: Role-based access control with admin flags and middleware-based route protection (with bypass opportunities)
- **Cross-Origin Integration**: Session sharing capabilities for Juice Shop payment integration

### Security Architecture (Educational Vulnerabilities)
The platform intentionally implements security anti-patterns for training purposes:

- **OWASP Top 10 Demonstrations**: Broken access control, cryptographic failures, injection vulnerabilities, insecure design patterns
- **API Security Issues**: Broken object-level authorization, excessive data exposure, lack of rate limiting
- **Financial Security Flaws**: Insufficient transaction validation, missing business logic controls, inadequate audit logging

## External Dependencies

### Core Framework Dependencies
- **Express.js**: Web application framework for Node.js providing HTTP server capabilities and middleware support
- **React 18**: Frontend framework with TypeScript support for building interactive user interfaces
- **Vite**: Build tool and development server with hot module replacement and optimized production builds

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with SQLite and PostgreSQL support, providing schema management and query building
- **better-sqlite3**: SQLite database driver for Node.js with synchronous API for development environments
- **Database Migrations**: Drizzle Kit for schema versioning and database migration management

### UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives providing accessible, customizable React components
- **Radix UI**: Unstyled, accessible component primitives for building design systems
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development with custom design tokens
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Payment Integration
- **PayPal Server SDK**: Integration with PayPal payment services for external payment processing capabilities
- **Cross-Platform Integration**: Custom URL adapter system for seamless integration with OWASP Juice Shop

### Development and Security Tools
- **TypeScript**: Static type checking for enhanced code quality and developer experience
- **ESLint**: Code linting with security-focused plugins including Microsoft SDL and SonarJS rules
- **OWASP ZAP Integration**: Automated security scanning capabilities for vulnerability assessment
- **Snyk Security Scanning**: Dependency vulnerability scanning and monitoring

### Session and Authentication
- **express-session**: Session middleware for Express.js with database storage backend
- **bcrypt**: Password hashing library for secure credential storage (with educational weaknesses)
- **Custom Authentication**: Session-based authentication system with intentional security vulnerabilities

### Internationalization and Utilities
- **date-fns**: Date manipulation and formatting library with locale support
- **nanoid**: Unique ID generation for session management and transaction tracking
- **Custom i18n System**: Internationalization framework supporting multiple locales with dynamic language switching