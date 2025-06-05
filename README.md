# WhoopsPay - Cybersecurity Training Platform

A comprehensive cybersecurity training and financial management platform that combines interactive security learning with intelligent financial tools. Built for educational purposes to demonstrate OWASP Top 10 and API Security vulnerabilities.

## 🎯 Purpose

WhoopsPay is designed as an **educational cybersecurity training platform** for penetration testing and security research. It intentionally contains vulnerabilities from the OWASP Top 10 and OWASP API Security Top 10 for learning purposes.

## ⚠️ Security Notice

**This application contains intentional security vulnerabilities for educational purposes only.**
- Do NOT use in production environments
- Only deploy in isolated, controlled environments
- Intended for cybersecurity training and research

## 🌟 Features

### Core Financial Platform
- User authentication and profile management
- Money transfer and request system
- Transaction history and management
- Digital wallet functionality
- Payment method management
- Real-time notifications

### Security Training Features
- OWASP Top 10 vulnerability demonstrations
- API Security vulnerability examples
- SQL injection scenarios
- Cross-site scripting (XSS) examples
- Insecure direct object references
- Authentication bypass scenarios
- Data exposure vulnerabilities

### Technical Features
- React.js frontend with TypeScript
- Express.js backend with Node.js
- PostgreSQL database with Drizzle ORM
- Real-time notifications system
- Internationalization (English UK, Greek)
- Responsive design with Tailwind CSS
- Admin panel for system management

## 🚀 Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui component library
- TanStack Query for data fetching
- Wouter for routing
- Framer Motion for animations

### Backend
- Node.js with Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL database
- Passport.js for authentication
- Express sessions
- WebSocket support

### Development Tools
- ESLint and Prettier
- Hot module replacement
- TypeScript strict mode
- Automatic database migrations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whoopspay.git
cd whoopspay
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database and configuration details:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/whoopspay
SESSION_SECRET=your-session-secret-key
NODE_ENV=development
PORT=5000
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🗃️ Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `transactions` - Money transfers and requests
- `payment_methods` - User payment methods
- `notifications` - System notifications
- `user_sessions` - Session management
- `sessions` - Express session storage

## 🌐 Internationalization

The platform supports multiple languages:
- English (UK) - Default
- Greek (Ελληνικά)

Language switching is available in the header navigation.

## 🛡️ Vulnerability Categories

### OWASP Top 10 (2021)
1. **A01 - Broken Access Control**
   - Insecure direct object references
   - Missing function level access control

2. **A02 - Cryptographic Failures**
   - Plain text password storage
   - Unencrypted sensitive data

3. **A03 - Injection**
   - SQL injection vulnerabilities
   - NoSQL injection examples

4. **A04 - Insecure Design**
   - Missing rate limiting
   - Insufficient business logic validation

5. **A05 - Security Misconfiguration**
   - Default configurations
   - Verbose error messages

6. **A06 - Vulnerable Components**
   - Outdated dependencies
   - Known vulnerable packages

7. **A07 - Authentication Failures**
   - Weak password policies
   - Session management flaws

8. **A08 - Software Integrity Failures**
   - Unsigned updates
   - Insecure CI/CD pipelines

9. **A09 - Logging Failures**
   - Insufficient logging
   - Log injection vulnerabilities

10. **A10 - Server-Side Request Forgery**
    - SSRF vulnerabilities
    - Internal network access

### OWASP API Security Top 10
- API1 - Broken Object Level Authorization
- API2 - Broken User Authentication
- API3 - Broken Object Property Level Authorization
- API4 - Unrestricted Resource Consumption
- API5 - Broken Function Level Authorization
- API6 - Unrestricted Access to Sensitive Business Flows
- API7 - Server Side Request Forgery
- API8 - Security Misconfiguration
- API9 - Improper Inventory Management
- API10 - Unsafe Consumption of APIs

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📁 Project Structure

```
whoopspay/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema definitions
└── README.md
```

## 🎓 Educational Use

This platform is designed for:
- Cybersecurity training courses
- Penetration testing practice
- Security awareness training
- Academic research
- Vulnerability assessment learning

## 🤝 Contributing

This is an educational project. Contributions that add new vulnerability examples or improve the learning experience are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is provided for educational and research purposes only. The authors are not responsible for any misuse or damage caused by this software. Users must comply with all applicable laws and regulations.

## 🆘 Support

For educational use and questions about the vulnerabilities demonstrated, please open an issue in the GitHub repository.

---

**Remember: This is a deliberately vulnerable application for educational purposes. Never use in production!**