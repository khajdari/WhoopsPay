# WhoopsPay - Educational Security Training Platform

## Overview

WhoopsPay is an educational cybersecurity training platform that simulates a comprehensive financial payment system while intentionally implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. The platform is designed for security professionals, developers, students, and penetration testers to learn about web application vulnerabilities, secure coding practices, and vulnerability assessment in a controlled environment.

The application includes a comprehensive Secure Software Development Lifecycle (SSDLC) pipeline with 4-phase security analysis: ESLint Security Linting, Snyk Code SAST, Snyk SCA dependency scanning, and OWASP ZAP DAST penetration testing. All security reports are automatically generated and stored as GitHub Actions artifacts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture (MVC Pattern)
The backend follows a Model-View-Controller pattern with clear separation of concerns:

- **Controllers**: Handle request processing and business logic coordination for authentication, user management, transactions, money requests, notifications, and administration. Each controller contains intentional security vulnerabilities for educational purposes.
- **Models**: Data layer abstraction using Drizzle ORM with SQLite for development and PostgreSQL support for production. The schema includes intentionally vulnerable table designs with plain text sensitive data storage.
- **Routes**: RESTful API endpoints with comprehensive routing configuration that demonstrates various OWASP vulnerabilities including broken access control and injection flaws.
- **Middleware**: Express middleware for authentication, authorization, and admin access control with intentionally weak security implementations.
- **Services**: Business logic layer prepared for expansion and external integrations, including OWASP Juice Shop integration for enhanced security training.

### Frontend Architecture (React + TypeScript)
The frontend uses modern React patterns with comprehensive component architecture:

- **Component-based UI**: Reusable components using shadcn/ui design system with Tailwind CSS for styling
- **State Management**: React Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing with authentication-based route protection
- **Internationalization**: Custom i18n system supporting English and Greek locales
- **Authentication**: Session-based authentication with persistent state management using Express sessions

### Database Design
SQLite-based development database with intentionally vulnerable schema design:

- **Users Table**: Contains deliberately exposed sensitive data including SSN and plain text passwords for educational purposes
- **Transactions Table**: Financial transaction records with minimal validation to demonstrate injection vulnerabilities
- **Payment Methods**: Credit card and bank account storage with weak encryption
- **Sessions**: Express session storage with vulnerable configuration for session hijacking demonstrations
- **Notifications & Issue Reports**: User communication systems with access control vulnerabilities

### Security Pipeline Architecture
Comprehensive 4-phase Secure SDLC pipeline:

- **Phase 1**: ESLint Security Linting with enterprise security plugins (eslint-plugin-security, @microsoft/eslint-plugin-sdl, eslint-plugin-sonarjs)
- **Phase 2**: Snyk Code SAST with DeepCode AI engine for maximum depth static analysis
- **Phase 3**: Snyk SCA for comprehensive dependency vulnerability scanning of 115+ project dependencies
- **Phase 4**: OWASP ZAP DAST for dynamic application security testing with automated penetration testing

All phases generate detailed HTML reports with vulnerability evidence and are integrated with GitHub Issues for automated security report creation.

## External Dependencies

### Core Technology Stack
- **Node.js & Express**: Backend server with session management
- **React & TypeScript**: Frontend application with type safety
- **Drizzle ORM**: Database abstraction layer with SQLite/PostgreSQL support
- **Better SQLite3**: Local database engine for development
- **Vite**: Build tool and development server

### UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives for React applications

### Security and Authentication
- **bcrypt**: Password hashing library (used selectively for educational contrast)
- **express-session**: Session management middleware with vulnerable configuration
- **ESLint Security Plugins**: Code quality and security validation tools

### Development and Testing Tools
- **Snyk**: Static application security testing and dependency vulnerability scanning
- **OWASP ZAP**: Dynamic application security testing and penetration testing
- **Docker**: Containerization for consistent deployment environments

### External Service Integrations
- **OWASP Juice Shop**: Integrated vulnerable web application for enhanced security training
- **PayPal SDK**: Payment processing integration for realistic financial transaction simulation
- **GitHub Actions**: CI/CD pipeline for automated security testing and report generation
- **Docker Hub**: Container registry for security-validated deployments

All external dependencies are intentionally configured with security vulnerabilities or minimal security controls to provide realistic training scenarios for cybersecurity education.