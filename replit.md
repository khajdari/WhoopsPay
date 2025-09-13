# Overview

WhoopsPay is an intentionally vulnerable financial application designed for cybersecurity education and training. It simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The application serves as a comprehensive hands-on training platform for security professionals, developers, and students to learn about application security in a controlled environment.

The platform includes core financial features like user authentication, digital wallet management, money transfers, transaction history, payment method management, and external payment processing. It also provides administrative features and integrates with OWASP Juice Shop for cross-platform payment processing scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for client-side routing with authentication-based route protection
- **State Management**: React Query for server state management combined with React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI with Tailwind CSS for styling
- **Internationalization**: Custom i18n system supporting English (UK) and Greek locales
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for API server implementation
- **Authentication**: Custom session-based authentication with intentionally vulnerable patterns
- **Middleware**: Custom security middleware demonstrating common vulnerabilities
- **Controllers**: MVC pattern with dedicated controllers for different functional areas
- **Routing**: RESTful API design with comprehensive endpoint coverage
- **Documentation**: Swagger/OpenAPI integration for API documentation

## Data Storage Architecture
- **Development Database**: SQLite with Drizzle ORM for local development
- **Production Database**: PostgreSQL configured via Drizzle for production deployments
- **Schema Management**: Shared schema definitions using Drizzle with TypeScript types
- **Session Storage**: Database-backed session management with configurable TTL

## Authentication and Authorization
- **Session Management**: Express-session with database storage and intentionally weak security
- **Password Handling**: Mixed plain text and bcrypt implementation for educational vulnerability demonstration
- **Admin Authorization**: Simple role-based access control with intentional privilege escalation vulnerabilities
- **API Security**: Minimal authentication checks demonstrating broken access control patterns

## Security Training Features
- **Vulnerability Implementation**: Intentional OWASP Top 10 and API Security Top 10 vulnerabilities
- **Security Pipeline**: 4-phase automated security testing (ESLint, SAST, SCA, DAST)
- **Educational Documentation**: Comprehensive vulnerability explanations and exploitation examples
- **Safe Environment**: Isolated training platform with clear educational disclaimers

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React Query v5 for state management, React Hook Form for form handling
- **Express.js**: Node.js web framework with TypeScript support and comprehensive middleware stack
- **Database**: Drizzle ORM for type-safe database operations, better-sqlite3 for development, PostgreSQL for production

## UI and Styling
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS for utility-first styling with custom theme configuration
- **Icons**: Lucide React for comprehensive icon library with consistent styling

## Authentication and Security
- **Session Management**: express-session for server-side session handling
- **Password Hashing**: bcrypt for secure password storage (mixed with plain text for vulnerability demonstration)
- **CORS**: cors middleware for cross-origin request handling

## Payment Integration
- **PayPal SDK**: Official PayPal Server SDK for external payment processing
- **Juice Shop Integration**: Custom integration for cross-platform payment scenarios

## Development and Security Tools
- **ESLint Security**: eslint-plugin-security, @microsoft/eslint-plugin-sdl, eslint-plugin-sonarjs
- **API Documentation**: swagger-jsdoc and swagger-ui-express for interactive API documentation
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation

## External Services
- **Payment Processing**: PayPal API for external payment gateway functionality
- **Juice Shop Integration**: Cross-platform payment processing with OWASP Juice Shop
- **Domain Configuration**: Dynamic URL adaptation for different deployment environments (development, production, Docker)

## Security Testing Pipeline
- **SAST**: Snyk Code for static application security testing
- **SCA**: Snyk Open Source for dependency vulnerability scanning  
- **DAST**: OWASP ZAP for dynamic application security testing
- **CI/CD**: GitHub Actions for automated security pipeline execution