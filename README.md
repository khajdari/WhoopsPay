# WhoopsPay - Educational Security Training Platform

**An intentionally vulnerable financial application designed for cybersecurity education and training**

WhoopsPay simulates a realistic online payment system while deliberately implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. It serves as a comprehensive hands-on learning environment for security professionals, developers, penetration testers, and students.

## ⚠️ **CRITICAL WARNING**
**This application contains intentional security vulnerabilities and should NEVER be deployed in production environments or used with real financial data. It is exclusively for educational and training purposes.**

---

## 🎯 **What is WhoopsPay?**

WhoopsPay is a full-featured financial application that includes:

### **Core Financial Features**
- **User Authentication & Registration** - Account creation and login system
- **Digital Wallet System** - User balance management and money storage  
- **Money Transfers** - Send and receive payments between users
- **Transaction History** - Complete audit trail of all financial activities
- **Payment Methods** - Credit card and bank account management
- **External Payment Processing** - Integration with PayPal and other services
- **Cross-Platform Integration** - Payment processing for OWASP Juice Shop

### **Administrative Features**
- **User Management Dashboard** - Admin controls for user accounts
- **Transaction Monitoring** - Real-time financial activity oversight
- **System Administration** - Database management and configuration
- **Security Reporting** - Issue tracking and incident management
- **Notification System** - Real-time alerts and messaging

### **Educational Security Features**
- **Intentional OWASP Top 10 Vulnerabilities** - Real-world security flaws
- **API Security Weaknesses** - Authentication and authorization bypasses
- **Comprehensive Security Testing Pipeline** - 4-phase automated security analysis
- **Detailed Vulnerability Documentation** - Learning materials and exploit examples

---

## 🚀 **Quick Start Guide**

### **System Requirements**
- **Node.js 20+** (Required for running the application)
- **Git** (For cloning the repository)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

### **Installation Steps**

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd whoopspay

# 2. Install all dependencies
npm install

# 3. Initialize the database (creates SQLite database with mock data)
npm run db:push

# 4. Start the development server
npm run dev
```

### **Accessing the Application**
- **Application URL**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (Swagger UI)
- **Default Admin Login**: Check the console output for admin credentials

The application runs on a single port (5000) with both frontend and backend integrated.

---

## 🏗️ **Technology Stack**

### **Frontend Technologies**
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Lightning-fast build tool and development server
- **shadcn/ui** - High-quality accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Powerful data fetching and state management
- **Wouter** - Lightweight client-side routing
- **React Hook Form** - Performant forms with validation

### **Backend Technologies**
- **Express.js** - Minimal and flexible Node.js web framework
- **TypeScript** - Full-stack type safety
- **SQLite** - Lightweight, file-based database
- **Drizzle ORM** - Type-safe database operations
- **better-sqlite3** - High-performance synchronous SQLite driver
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing library
- **Express Session** - Session management middleware

### **Security & Testing Tools**
- **ESLint Security Plugins** - Static code security analysis
- **Snyk Code** - Advanced SAST (Static Application Security Testing)
- **OWASP ZAP** - Dynamic application security testing
- **Swagger/OpenAPI** - API documentation and testing

### **Development Tools**
- **tsx** - TypeScript execution environment
- **Concurrently** - Run multiple commands simultaneously
- **ESBuild** - Ultra-fast JavaScript bundler

---

## 🏛️ **System Architecture**

WhoopsPay follows a modern monorepo architecture with integrated frontend and backend:

### **Frontend Architecture**
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for client-side routing with authentication-based route protection  
- **State Management**: TanStack Query for server state management combined with React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI with Tailwind CSS for styling
- **Internationalization**: Custom i18n system supporting English (UK) and Greek locales
- **Build Tool**: Vite for fast development and optimized production builds

### **Backend Architecture** 
- **Framework**: Express.js with TypeScript for API server implementation
- **Authentication**: Custom session-based authentication with intentionally vulnerable patterns
- **Middleware**: Custom security middleware demonstrating common vulnerabilities
- **Controllers**: MVC pattern with dedicated controllers for different functional areas
- **Routing**: RESTful API design with comprehensive endpoint coverage
- **Documentation**: Swagger/OpenAPI integration for interactive API documentation

### **Data Storage Architecture**
- **Database**: SQLite with better-sqlite3 driver for all environments
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Shared schema definitions using Drizzle with TypeScript types
- **Session Storage**: Database-backed session management with configurable TTL
- **File Location**: `data/whoopspay.db` (committed to repository for easy setup)

### **Authentication and Authorization**
- **Session Management**: Express-session with SQLite storage and intentionally weak security
- **Password Handling**: Mixed plain text and bcrypt implementation for educational vulnerability demonstration
- **Admin Authorization**: Simple role-based access control with intentional privilege escalation vulnerabilities  
- **API Security**: Minimal authentication checks demonstrating broken access control patterns

---

## 🔐 **Educational Vulnerabilities**

WhoopsPay intentionally implements real-world security vulnerabilities for hands-on learning:

### **OWASP Top 10 2021 Coverage**
- **A01 Broken Access Control** - Users can access other users' data
- **A02 Cryptographic Failures** - Plain text sensitive data storage
- **A03 Injection** - SQL injection and XSS opportunities
- **A04 Insecure Design** - Missing security controls and validation
- **A05 Security Misconfiguration** - Exposed interfaces and verbose errors
- **A07 Authentication Failures** - Weak session and password management
- **A09 Logging & Monitoring Failures** - Insufficient security monitoring

### **OWASP API Security Top 10**
- **API1 Broken Object Level Authorization** - Direct object access
- **API2 Broken User Authentication** - Weak API authentication
- **API3 Excessive Data Exposure** - Over-disclosure in API responses
- **API4 Unrestricted Resource Consumption** - Missing rate limiting
- **API5 Broken Function Level Authorization** - Admin endpoint access

---

## 🛡️ **Automated Security Testing**

WhoopsPay includes a comprehensive **Secure SDLC Pipeline** with 6 phases (4 security phases + Docker deployment + Render cloud deployment):

### **Security Training Features**
- **Vulnerability Implementation**: Intentional OWASP Top 10 and API Security Top 10 vulnerabilities
- **Security Pipeline**: 4-phase automated security testing (ESLint, SAST, SCA, DAST)
- **Educational Documentation**: Comprehensive vulnerability explanations and exploitation examples
- **Safe Environment**: Isolated training platform with clear educational disclaimers

### **Phase 1: 🛡️ ESLint Security Linting**
- **Static code analysis** with security-focused rules
- **Microsoft SDL compliance** checking
- **SonarJS quality** and vulnerability detection
- **Output**: Detailed security reports with line-by-line analysis

### **Phase 2: 🔒 SAST (Static Application Security Testing)**
- **Snyk Code** with DeepCode AI engine
- **Cross-file data flow** analysis
- **Vulnerability detection**: XSS, SQL injection, cryptographic issues
- **Output**: Professional security reports with remediation guidance

### **Phase 3: 📦 SCA (Software Composition Analysis)**  
- **Dependency vulnerability scanning** with Snyk
- **Transitive dependency analysis** across 115+ packages
- **Known vulnerability database** matching
- **Output**: Comprehensive dependency security reports

### **Phase 4: ⚡ DAST (Dynamic Application Security Testing)**
- **OWASP ZAP penetration testing** on running application
- **Automated vulnerability discovery** with active scanning
- **Real exploit verification** and evidence collection
- **Output**: Detailed vulnerability reports with proof-of-concept

### **Phase 5: 🐳 Docker Hub Deployment**
- **Multi-platform Docker builds** with semantic versioning
- **Automated registry publishing** to Docker Hub
- **Image tagging strategy** with version and latest tags
- **Output**: Production-ready container images

### **Phase 6: 🌐 Render Production Deployment**
- **Automated cloud deployment** using latest Docker image
- **Zero-downtime deployments** with health checks
- **Production environment provisioning** 
- **Output**: Live application accessible via Render URL

---

## 🚀 **GitHub Actions Deployment Pipeline**

### **Required GitHub Secrets**
For complete CI/CD automation, configure these secrets in your repository:

```bash
# Docker Hub Integration
DOCKER_HUB_USERNAME=ghaidaris
DOCKER_HUB_ACCESS_TOKEN_V2=dckr_pat_[your_token]

# Render Cloud Deployment
RENDER_API=rnd_[your_render_api_key]
RENDER_SERVICE_ID=srv-[your_service_id]
```

### **Pipeline Execution Flow**
1. **Code Push** → Triggers complete security analysis
2. **Security Reports** → Generated as GitHub Issues with downloadable artifacts
3. **Docker Build** → Multi-platform image with semantic versioning
4. **Registry Push** → Published to `ghaidaris/whoopspay:latest`
5. **Live Deployment** → Automatic deployment to Render cloud platform

### **Production Access**
- **Docker Hub**: [https://hub.docker.com/r/ghaidaris/whoopspay](https://hub.docker.com/r/ghaidaris/whoopspay)
- **Live Application**: Available on your Render service URL after deployment

---

## 📁 **Key Features Deep Dive**

### **Financial Operations**
- **Wallet Management**: Add/withdraw funds, check balances
- **Money Transfers**: Send payments with transaction verification
- **Payment Methods**: Store credit cards and bank accounts (intentionally insecure)
- **Transaction Categories**: ONUS (internal) and OFFUS (external) payments
- **Receipt Generation**: Downloadable transaction confirmations

### **User Experience**
- **Multi-language Support** - English and Greek localization
- **Dark/Light Mode** - Adaptive theme switching
- **Responsive Design** - Mobile and desktop compatibility
- **Real-time Notifications** - Live updates for transactions and messages

### **Integration Capabilities**
- **Juice Shop Integration** - Cross-platform payment processing
- **PayPal Integration** - External payment service simulation
- **Webhook Support** - External system notifications
- **API Documentation** - Complete Swagger/OpenAPI specification

---

## 📚 **Documentation**

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture and design patterns
- **[DOCKER.md](DOCKER.md)** - Container deployment and Docker configuration
- **[SECURITY.md](SECURITY.md)** - Complete security guide and vulnerability catalog
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development environment setup and workflows

---

## 🎓 **Learning Objectives**

By working with WhoopsPay, you will learn:

### **Vulnerability Discovery**
- How to identify and exploit common web application vulnerabilities
- Practical experience with OWASP Top 10 security risks
- Understanding of API security weaknesses and attack vectors

### **Secure Development**
- Proper implementation of authentication and authorization
- Secure coding practices and input validation techniques  
- Database security and encryption best practices

### **Security Testing**
- Static and dynamic application security testing methodologies
- Automated security pipeline integration
- Vulnerability assessment and penetration testing techniques

### **Incident Response**
- Security monitoring and logging implementation
- Vulnerability remediation strategies
- Security architecture and threat modeling

---

## 🛠️ **Development Commands**

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build

# Production server
npm run start

# Database operations
npm run db:push              # Sync database schema
npm run db:push --force      # Force sync (if conflicts)

# Code quality
npm run check                # TypeScript type checking
```

---

## ⚖️ **Legal & Ethical Use**

### **Authorized Use Only**
- ✅ Educational environments and controlled labs
- ✅ Security training and professional development
- ✅ Penetration testing practice with proper authorization
- ❌ **NEVER** in production environments
- ❌ **NEVER** with real financial data or credentials
- ❌ **NEVER** against systems you don't own

### **Responsible Disclosure**
If you discover unintended vulnerabilities, please report them responsibly through appropriate channels.

---

## 🤝 **Contributing**

Contributions that enhance the educational value while maintaining realistic vulnerability examples are welcome. Please ensure:
- All vulnerabilities remain realistic and educational
- Documentation clearly explains security concepts  
- Code examples demonstrate both vulnerable and secure patterns
- Contributions maintain the educational focus

---

## 📄 **License & Disclaimer**

This project is provided for **educational purposes only**. The developers are not responsible for any misuse of this application or any damages resulting from its use. Users must ensure their activities comply with applicable laws and regulations.

**Remember: The goal is education and security awareness, not exploitation or harm.**