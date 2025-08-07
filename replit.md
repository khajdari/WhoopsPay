# WhoopsPay - Educational Security Training Platform

**⚠️ WARNING: This application contains intentional security vulnerabilities for educational purposes. NEVER use this code in production environments!**

## Overview

WhoopsPay is a comprehensive educational cybersecurity training platform built as a realistic financial application with proper MVC architecture. It demonstrates common security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10 in a controlled environment. The platform combines interactive security learning with intelligent transaction processing, featuring a full-stack architecture with React frontend, Express backend using MVC design patterns, and SQLite database.

The application serves as a training tool for security professionals, developers, students, and penetration testers to understand web application vulnerabilities and secure coding practices. It includes intentional security flaws such as broken access control, cryptographic failures, injection vulnerabilities, and insecure design patterns.

## Recent Changes (August 2025)

### Latest Updates
- **Comprehensive OWASP Vulnerability Documentation**: Systematic enhancement of security vulnerability comments across entire codebase
- **Educational Security Comments**: All controllers, middleware, and critical client components now contain detailed OWASP Top 10 and API Security Top 10 vulnerability explanations
- **Training Platform Enhancement**: Enhanced educational value with specific vulnerability examples and security weakness explanations
- **Backend Security Documentation**: Complete vulnerability documentation in AuthController, UserController, TransactionController, AdminController, MoneyRequestController, and NotificationController
- **Client-Side Vulnerability Comments**: Enhanced frontend components (Login, Dashboard, Administration, Transactions, Send Money) with client-side security vulnerability explanations
- **Infrastructure Security Documentation**: Updated storage layer, authentication middleware, and routing with comprehensive security vulnerability documentation

### Previous Updates (December 2024)
- **Docker Support**: Complete Docker configuration with multi-stage builds and health checks
- **Docker Compose**: Full orchestration of WhoopsPay + OWASP Juice Shop containers
- **Environment Detection**: Enhanced URL adapter supports Docker, localhost, and Replit environments  
- **Production Ready**: Optimized Docker images with security best practices
- **MVC Architecture Implementation**: Refactored monolithic routes.ts into proper MVC structure with dedicated controllers
- **Modular Organization**: Moved Juice Shop integration into separate modules/juice-shop directory  
- **Controller Layer**: Created dedicated controllers for Auth, User, Transaction, MoneyRequest, Notification, and Admin operations
- **Middleware Organization**: Moved middleware into dedicated middleware/ directory
- **Service Layer**: Prepared structure for business logic separation
- **URL Adapter**: Dynamic URL adaptation now works across localhost, Replit, and production environments
- **Clean Project Structure**: Removed unnecessary documentation files and organized codebase

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development and modern hooks
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with design system consistency
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management, caching, and real-time data synchronization
- **Shadcn/ui** component library with Radix UI primitives for accessible, customizable components

### Backend Architecture (MVC Pattern)
- **Express.js** server with TypeScript for type-safe API development
- **MVC Architecture**:
  - **Controllers**: `server/controllers/` - AuthController, UserController, TransactionController, MoneyRequestController, NotificationController, AdminController
  - **Models**: `shared/schema.ts` - Database schema definitions with Drizzle ORM
  - **Services**: `server/services/` - Business logic layer (prepared for future expansion)
  - **Middleware**: `server/middleware/` - Authentication, authorization, and logging middleware
  - **Modules**: `server/modules/` - External integrations (Juice Shop, PayPal, etc.)
- **Session-based authentication** using express-session with bcrypt password hashing
- **RESTful API design** with comprehensive CRUD operations and business logic endpoints
- **Organized route structure** in `server/routes/index.ts` with controller-based handling

### Database Architecture
- **SQLite** with better-sqlite3 for reliable local development and educational purposes
- **Drizzle ORM** with schema definitions for type-safe database operations
- **Intentionally vulnerable schema** with plain text sensitive data storage for educational demonstration
- **In-memory caching** for performance optimization of frequently accessed data

### Authentication & Authorization
- **Session-based authentication** with secure cookie configuration
- **Role-based access control** with admin and user privilege levels
- **bcrypt password hashing** for credential storage (some plain text for vulnerability demonstration)
- **Session middleware** for request authentication and user context management

### Security Training Features
- **Comprehensive OWASP Top 10 vulnerabilities** with detailed educational comments explaining each vulnerability type
- **API Security Top 10 vulnerabilities** demonstrating broken authorization, excessive data exposure, and improper inventory management
- **Educational vulnerability documentation** with specific examples and security weakness explanations throughout codebase
- **Client-side security vulnerabilities** including DOM-based XSS, client-side privilege escalation, and insecure data handling
- **Server-side vulnerabilities** including SQL injection, broken access control, cryptographic failures, and insecure design patterns
- **Financial security vulnerabilities** specific to payment processing, transaction validation, and monetary controls
- **Administrative security vulnerabilities** including privilege escalation, weak admin verification, and exposed system information
- **Authentication and session management vulnerabilities** with detailed explanations of security weaknesses
- **Direct object references** without proper authorization checks and comprehensive IDOR examples
- **Verbose error handling** and insufficient logging with educational security analysis

### External Integrations
- **Juice Shop integration** for cross-platform payment processing demonstration
- **PayPal SDK integration** for external payment gateway simulation
- **Docker containerization** with multi-service orchestration
- **Environment detection** supporting Docker, Replit, and localhost configurations
- **Health check endpoints** for container monitoring and load balancing

### Development Tools
- **TypeScript** throughout for enhanced developer experience and type safety
- **ESBuild** for fast server-side bundling and production builds
- **Hot module replacement** with Vite for rapid development iteration
- **Component architecture** with reusable UI components and custom hooks
- **Docker support** with multi-stage builds, health checks, and development overrides
- **Container orchestration** using Docker Compose for local development

## External Dependencies

### Core Framework Dependencies
- **React 18** - Frontend UI framework with modern hooks and concurrent features
- **Express.js** - Backend web application framework for Node.js
- **TypeScript** - Type-safe JavaScript development across frontend and backend
- **Vite** - Modern build tool and development server

### Database & ORM
- **better-sqlite3** - Embedded SQLite database for local development
- **Drizzle ORM** - Type-safe SQL query builder and schema management
- **drizzle-kit** - Database migration and schema management tools

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Unstyled, accessible UI primitives for component foundation
- **Lucide React** - Icon library with consistent SVG icons
- **date-fns** - Modern JavaScript date utility library

### State Management & Data Fetching
- **TanStack Query** - Powerful data synchronization for server state management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation library

### Authentication & Security
- **bcrypt** - Password hashing library for credential security
- **express-session** - Session middleware for Express applications

### Development & Build Tools
- **ESBuild** - Fast JavaScript bundler for production builds
- **tsx** - TypeScript execution environment for development
- **nanoid** - URL-safe unique string ID generator

### External Services
- **PayPal Server SDK** - Payment processing integration for external transactions
- **Juice Shop simulation** - External e-commerce platform for payment flow demonstration