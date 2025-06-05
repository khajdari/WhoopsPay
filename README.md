# WhoopsPay - Educational Security Training Platform

**⚠️ WARNING: This application contains intentional security vulnerabilities for educational purposes. NEVER use this code in production environments!**

WhoopsPay is an advanced cybersecurity training and financial management platform that combines interactive security learning with intelligent transaction processing. The application provides a comprehensive, gamified approach to financial interactions, focusing on user education and secure money movement.

## 🎯 Project Overview

WhoopsPay demonstrates common security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10 in a realistic financial application context. This platform is designed for:

- **Security Professionals** learning about web application vulnerabilities
- **Developers** understanding secure coding practices
- **Students** studying cybersecurity and web development
- **Penetration Testers** practicing vulnerability assessment

## 🔥 Educational Vulnerabilities Included

### OWASP Top 10 2021
- **A01: Broken Access Control** - IDOR vulnerabilities, privilege escalation
- **A02: Cryptographic Failures** - Plain text data storage, weak encryption
- **A03: Injection** - SQL injection vulnerabilities
- **A04: Insecure Design** - Missing rate limiting, insufficient validation
- **A05: Security Misconfiguration** - Verbose error messages, default configurations
- **A07: Identification and Authentication Failures** - Weak session management
- **A09: Security Logging and Monitoring Failures** - Insufficient audit logging

### OWASP API Security Top 10
- **API1: Broken Object Level Authorization** - Direct object access without checks
- **API2: Broken User Authentication** - Weak authentication mechanisms
- **API3: Broken Object Property Level Authorization** - Excessive data exposure
- **API4: Unrestricted Resource Consumption** - No rate limiting on operations
- **API5: Broken Function Level Authorization** - Missing role-based access control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd whoopspay
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/whoopspay
SESSION_SECRET=your-secret-key-here
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the application**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 👥 Demo Users

The application includes pre-configured demo users for testing:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| jdoe | password123 | User | Regular user account |
| admin | admin123 | Admin | Full administrative privileges |
| moderator | mod123 | Moderator | Limited administrative access |

## 🎮 Key Features

### Financial Management
- **Dashboard** - Account balance and transaction overview
- **Send Money** - Transfer funds between users
- **Payment Methods** - Manage credit cards and bank accounts
- **Transaction History** - Complete audit trail of all activities

### Security Training Features
- **Vulnerability Demonstrations** - Live examples of security flaws
- **Educational Annotations** - Detailed comments explaining vulnerabilities
- **Interactive Learning** - Hands-on experience with real vulnerabilities
- **Progressive Difficulty** - From basic to advanced security concepts

### External Integration
- **Juice Shop Integration** - Cross-platform payment processing
- **External Payment API** - Third-party e-commerce checkout
- **Multi-application Flow** - Realistic business scenario simulation

### Administrative Features
- **User Management** - Create, modify, and delete user accounts
- **Transaction Monitoring** - Real-time transaction oversight
- **System Logs** - Comprehensive audit and monitoring
- **Security Dashboard** - Vulnerability status and metrics

## 🔧 Technology Stack

### Frontend
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first styling framework
- **Shadcn/ui** - High-quality component library
- **TanStack Query** - Powerful data synchronization
- **Wouter** - Minimalist client-side routing

### Backend
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe server development
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database operations
- **Express Session** - Session-based authentication
- **bcrypt** - Password hashing and verification

### Development Tools
- **Vite** - Lightning-fast build tool
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Concurrently** - Run multiple npm scripts

## 📚 Learning Objectives

After using WhoopsPay, users will understand:

1. **Common Web Vulnerabilities** - How they occur and their impact
2. **Secure Coding Practices** - Proper implementation techniques
3. **Authentication Security** - Session management and access control
4. **API Security** - Protecting endpoints and data
5. **Input Validation** - Preventing injection attacks
6. **Error Handling** - Secure error reporting
7. **Database Security** - Safe data storage and retrieval

## 🧪 Testing and Exploration

### Security Testing
- Use tools like Burp Suite, OWASP ZAP, or browser dev tools
- Explore different user roles and permission levels
- Test input validation and error handling
- Examine API responses for data exposure

### Juice Shop Integration Testing
1. Start Juice Shop on port 3001
2. Configure WhoopsPay payment integration
3. Test cross-application payment flows
4. Examine external authentication vulnerabilities

## 📖 Documentation Structure

- `README.md` - This overview and setup guide
- `ARCHITECTURE.md` - Detailed system architecture
- `SECURITY_DOCUMENTATION.md` - Vulnerability details and explanations
- `JUICE_SHOP_INTEGRATION.md` - External integration setup
- `LOCAL_SETUP.md` - Detailed local development setup
- `DEPLOYMENT.md` - Production deployment considerations

## 🤝 Contributing

This is an educational project. When contributing:

1. Maintain the educational focus
2. Document new vulnerabilities clearly
3. Ensure code remains intentionally vulnerable where appropriate
4. Add comprehensive comments explaining security issues
5. Test all functionality thoroughly

## ⚖️ Legal and Ethical Use

This application is intended solely for educational purposes. Users must:

- Use only in controlled, authorized environments
- Never deploy to production systems
- Respect all applicable laws and regulations
- Follow responsible disclosure practices
- Use knowledge gained for defensive purposes only

## 📞 Support

For questions about the educational content or technical issues:

1. Review the documentation files
2. Check the inline code comments
3. Examine the security annotations
4. Test in a safe, isolated environment

## 🏆 Acknowledgments

This project demonstrates security concepts from:
- OWASP Top 10 Project
- OWASP API Security Top 10
- OWASP Juice Shop
- Security research community best practices

---

**Remember: This application contains intentional vulnerabilities. Use responsibly and only for educational purposes.**