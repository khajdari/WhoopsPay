# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The platform serves as a comprehensive hands-on learning environment for security professionals, developers, and students studying application security.

The application includes core financial features like user authentication, digital wallet management, money transfers, transaction history, and payment method integration. It also features administrative controls, real-time notifications, and cross-platform integration with OWASP Juice Shop for payment processing scenarios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with authentication guards
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Internationalization**: Custom i18n system supporting English and Greek languages
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API services
- **Authentication**: Express-session based authentication with intentionally weak security for educational purposes
- **Controllers**: Modular controller architecture separating business logic by domain (Auth, User, Transaction, Admin, etc.)
- **API Documentation**: Swagger/OpenAPI integration with auto-generated documentation
- **Security Pipeline**: 4-phase automated security testing (ESLint Security, SAST, SCA, DAST)

### Data Storage
- **Development Database**: SQLite with Drizzle ORM for local development and testing
- **Production Database**: PostgreSQL support configured through Drizzle with environment-based switching
- **Schema Management**: Shared TypeScript schema definitions with Zod validation
- **Session Storage**: Database-backed session management with configurable TTL

### Authentication & Authorization
- **Session Management**: Express-session with intentionally weak security configurations
- **Password Handling**: Mixed plain text and bcrypt hashing for vulnerability demonstration
- **Admin Privileges**: Simple boolean flag system with IDOR vulnerabilities
- **OWASP Vulnerabilities**: Broken access control, weak authentication, and session management flaws

### Development & Deployment
- **Development**: Hot reload with Vite middleware integration
- **Containerization**: Docker support with multi-stage builds and SQLite persistence
- **CI/CD**: GitHub Actions workflow with comprehensive security scanning
- **Environment Configuration**: Dynamic domain adaptation for different deployment scenarios

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React Query for state management, React Hook Form for form handling
- **UI Framework**: Radix UI primitives, Tailwind CSS, shadcn/ui component library
- **Backend Framework**: Express.js, TypeScript, tsx for development execution

### Database & ORM
- **Database**: SQLite (development), PostgreSQL (production via environment configuration)
- **ORM**: Drizzle ORM with TypeScript schema definitions and migration support
- **Session Storage**: express-session with database persistence

### Security & Authentication
- **Password Hashing**: bcrypt for educational comparison with plain text storage
- **Session Management**: express-session with intentionally weak configurations
- **Security Testing**: ESLint security plugins, Snyk Code SAST, OWASP ZAP DAST

### Payment Integration
- **PayPal SDK**: @paypal/paypal-server-sdk for external payment processing
- **Juice Shop Integration**: Custom module for cross-platform payment scenarios

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint with security-focused rule sets and Microsoft SDL
- **API Documentation**: swagger-jsdoc and swagger-ui-express for interactive API docs
- **Testing**: Comprehensive security pipeline with multiple scanning tools

### Internationalization & UI
- **Language Support**: Custom i18n system with English and Greek translations
- **Date Formatting**: date-fns for consistent date handling across locales
- **Icons**: Lucide React for consistent iconography
- **Responsive Design**: Custom mobile detection hooks and responsive components