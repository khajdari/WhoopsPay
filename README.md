# WhoopsPay - Educational Security Training Platform

WhoopsPay is a comprehensive educational cybersecurity training platform that simulates a realistic financial payment system while intentionally implementing security vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10. 

## 🎯 Purpose

This application is designed for security professionals, developers, students, and penetration testers to learn about web application vulnerabilities, secure coding practices, and vulnerability assessment in a controlled environment.

## ⚠️ Security Warning

**This application contains intentional security vulnerabilities for educational purposes. NEVER deploy this in a production environment or with real financial data.**

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd whoopspay

# Install dependencies
npm install

# Setup database
npm run db:push

# Start the application
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗️ Features

- **User Authentication & Management**: Registration, login, profile management
- **Financial Operations**: Money transfers, transaction history, balance management
- **Payment Methods**: Credit cards, bank accounts, external payment processing
- **Administrative Controls**: User management, system monitoring
- **Cross-Platform Integration**: Juice Shop payment simulation

## 🔐 Educational Vulnerabilities

### OWASP Top 10 2021 Implemented:
- **A01**: Broken Access Control
- **A02**: Cryptographic Failures  
- **A03**: Injection
- **A04**: Insecure Design
- **A05**: Security Misconfiguration
- **A07**: Identification and Authentication Failures
- **A09**: Security Logging and Monitoring Failures

### OWASP API Security Top 10:
- **API1**: Broken Object Level Authorization
- **API2**: Broken User Authentication
- **API3**: Excessive Data Exposure
- **API4**: Unrestricted Resource Consumption
- **API5**: Broken Function Level Authorization

## 🛡️ Security Pipeline

WhoopsPay includes a comprehensive Secure SDLC pipeline with 4 security phases:

1. **🛡️ ESLint Security Linting** - Code quality and security validation
2. **🔒 SAST (Snyk Code)** - Static application security testing
3. **📦 SCA (Snyk)** - Software composition analysis  
4. **⚡ DAST (OWASP ZAP)** - Dynamic application security testing

## 📚 Documentation

- [Architecture Guide](ARCHITECTURE.md) - System design and components
- [Docker Guide](DOCKER.md) - Containerization and deployment
- [Security Guide](SECURITY.md) - Vulnerability details and training materials

## 🤝 Contributing

This is an educational project. Contributions that enhance the learning experience while maintaining security vulnerability examples are welcome.

## 📄 License

This project is for educational purposes only. See LICENSE for details.

## ⚠️ Disclaimer

WhoopsPay is intentionally vulnerable and should only be used for educational security training. The authors are not responsible for any misuse of this application.