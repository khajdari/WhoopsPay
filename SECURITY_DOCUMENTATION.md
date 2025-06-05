# PayPwned Security Documentation - OWASP Vulnerability Training Platform

## ⚠️ CRITICAL WARNING
This application contains **intentional security vulnerabilities** for educational purposes only. 
**NEVER deploy this code in production environments or with real user data.**

## Educational Purpose
PayPwned demonstrates common security vulnerabilities found in web applications, specifically targeting:
- OWASP Top 10 (2021)
- OWASP API Security Top 10
- Common web application security flaws

## OWASP Top 10 Vulnerabilities Implemented

### A01: Broken Access Control
**Location**: Throughout the application
**Examples**:
- `server/routes.ts`: Missing authorization checks on transaction endpoints
- `server/storage.ts`: Direct object access without ownership validation
- `client/src/pages/admin.tsx`: Admin panel accessible without proper role verification

**Code Examples**:
```javascript
// VULNERABLE: No authorization check before accessing user data
app.get('/api/users/:id/profile', async (req, res) => {
  const user = await storage.getUser(req.params.id); // IDOR vulnerability
  res.json(user);
});

// VULNERABLE: Direct transaction access without ownership check
async getTransaction(id: number): Promise<Transaction | undefined> {
  return await db.select().from(transactions).where(eq(transactions.id, id));
}
```

### A02: Cryptographic Failures
**Location**: Database schema and storage layer
**Examples**:
- `shared/schema.ts`: Plain text password storage
- Unencrypted sensitive data (SSN, bank accounts, credit cards)

**Code Examples**:
```javascript
// VULNERABLE: Plain text password storage
export const users = pgTable("users", {
  password: varchar("password"), // Should be hashed
  ssn: varchar("ssn"), // Should be encrypted
  creditCard: varchar("credit_card"), // Should be encrypted
});
```

### A03: Injection
**Location**: Database queries and user input handling
**Examples**:
- `server/storage.ts`: SQL injection in search functionality
- `client/src/components/send-money-modal.tsx`: XSS in description fields

**Code Examples**:
```javascript
// VULNERABLE: SQL injection via dynamic query construction
async searchUsers(query: string): Promise<User[]> {
  return await db.execute(sql`SELECT * FROM users WHERE name LIKE '%${query}%'`);
}

// VULNERABLE: XSS in user input
<Input
  value={description}
  onChange={(e) => setDescription(e.target.value)} // No sanitization
/>
```

### A04: Insecure Design
**Location**: Business logic and application architecture
**Examples**:
- Missing rate limiting on money transfers
- No transaction amount limits
- Insufficient business logic validation

**Code Examples**:
```javascript
// VULNERABLE: No amount validation or rate limiting
app.post('/api/transactions', async (req, res) => {
  // Anyone can send any amount
  const transaction = await storage.createTransaction(req.body);
});
```

### A05: Security Misconfiguration
**Location**: Error handling and server configuration
**Examples**:
- Verbose error messages exposing system information
- Default configurations maintained

**Code Examples**:
```javascript
// VULNERABLE: Verbose error messages
catch (error) {
  console.error("Database error:", error); // Logs sensitive info
  res.status(500).json({ 
    message: "Database connection failed", 
    error: error.message // Exposes internal details
  });
}
```

### A06: Vulnerable and Outdated Components
**Location**: Dependencies and third-party libraries
**Examples**:
- Intentionally using older versions of some packages
- Missing security patches

### A07: Identification and Authentication Failures
**Location**: Authentication and session management
**Examples**:
- Weak session management
- Missing multi-factor authentication
- Predictable session tokens

**Code Examples**:
```javascript
// VULNERABLE: Weak session configuration
app.use(session({
  secret: 'weak-secret', // Hardcoded secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Not secure in production
}));
```

### A08: Software and Data Integrity Failures
**Location**: Update mechanisms and CI/CD pipeline
**Examples**:
- Missing integrity checks on updates
- Insecure deserialization

### A09: Security Logging and Monitoring Failures
**Location**: Logging implementation
**Examples**:
- Insufficient logging of security events
- Missing monitoring for suspicious activities

**Code Examples**:
```javascript
// VULNERABLE: No security event logging
app.post('/api/transactions', async (req, res) => {
  // No logging of money transfer attempts
  const transaction = await storage.createTransaction(req.body);
});
```

### A10: Server-Side Request Forgery (SSRF)
**Location**: External API calls
**Examples**:
- Unvalidated URLs in payment processing
- Missing whitelist for external requests

## OWASP API Security Top 10 Vulnerabilities

### API1: Broken Object Level Authorization
**Examples**:
```javascript
// VULNERABLE: Access any user's transactions
app.get('/api/transactions/:id', async (req, res) => {
  const transaction = await storage.getTransaction(req.params.id);
  res.json(transaction); // No ownership check
});
```

### API2: Broken User Authentication
**Examples**:
- Weak JWT implementation
- Missing token validation

### API3: Broken Object Property Level Authorization
**Examples**:
```javascript
// VULNERABLE: Exposing all user properties
app.get('/api/users/:id', async (req, res) => {
  const user = await storage.getUser(req.params.id);
  res.json(user); // Exposes sensitive fields like SSN
});
```

### API4: Unrestricted Resource Consumption
**Examples**:
- No rate limiting on API endpoints
- Missing pagination controls

### API5: Broken Function Level Authorization
**Examples**:
```javascript
// VULNERABLE: Admin functions without role check
app.delete('/api/users/:id', async (req, res) => {
  await storage.deleteUser(req.params.id); // No admin check
});
```

## File-by-File Vulnerability Documentation

### Server Files

#### `server/routes.ts`
- **Primary Vulnerabilities**: A01, A03, A04, A05, A09, API1, API2, API5
- **Key Issues**: Missing authorization, verbose errors, no rate limiting
- **Educational Value**: Demonstrates multiple API security failures

#### `server/storage.ts`
- **Primary Vulnerabilities**: A01, A02, A03, A07, API1, API3
- **Key Issues**: Direct object access, plain text storage, SQL injection
- **Educational Value**: Shows database security anti-patterns

#### `server/db.ts`
- **Primary Vulnerabilities**: A05, A02
- **Key Issues**: Database configuration, connection security
- **Educational Value**: Infrastructure security basics

### Shared Files

#### `shared/schema.ts`
- **Primary Vulnerabilities**: A02, A04, A07
- **Key Issues**: Plain text sensitive data, weak constraints
- **Educational Value**: Database design security principles

### Client Files

#### `client/src/components/send-money-modal.tsx`
- **Primary Vulnerabilities**: A03, A04, A05
- **Key Issues**: XSS vulnerabilities, missing validation
- **Educational Value**: Frontend security best practices

#### `client/src/pages/admin.tsx`
- **Primary Vulnerabilities**: A01, API5
- **Key Issues**: Missing role-based access control
- **Educational Value**: Administrative interface security

## Learning Objectives

By studying this codebase, security professionals and students will learn to:

1. **Identify Security Vulnerabilities**: Recognize common security flaws in real code
2. **Understand Impact**: See how vulnerabilities can be exploited
3. **Learn Mitigation**: Understand proper security implementations
4. **Practice Assessment**: Conduct security reviews and penetration testing
5. **Develop Secure Code**: Apply security principles in development

## Remediation Examples

For each vulnerability, consider these secure alternatives:

### Secure Access Control
```javascript
// SECURE: Proper authorization check
app.get('/api/transactions/:id', isAuthenticated, async (req, res) => {
  const transaction = await storage.getTransaction(req.params.id);
  if (transaction.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json(transaction);
});
```

### Secure Data Storage
```javascript
// SECURE: Encrypted sensitive data
export const users = pgTable("users", {
  passwordHash: varchar("password_hash"), // Properly hashed
  ssnEncrypted: varchar("ssn_encrypted"), // Encrypted at rest
});
```

### Secure Input Validation
```javascript
// SECURE: Input validation and sanitization
const transactionSchema = z.object({
  amount: z.number().min(0.01).max(10000),
  description: z.string().max(500).refine(
    (val) => !containsScript(val), // XSS prevention
    "Invalid characters in description"
  )
});
```

## Testing Guidelines

### Security Testing Approach
1. **Static Analysis**: Review code for vulnerability patterns
2. **Dynamic Testing**: Test running application for security flaws
3. **Penetration Testing**: Attempt to exploit identified vulnerabilities
4. **Code Review**: Manual examination of security implementations

### Test Cases by Vulnerability
Each OWASP category should be tested with specific scenarios:
- **A01**: Attempt to access other users' data
- **A02**: Check for plain text sensitive data storage
- **A03**: Test input fields for injection attacks
- **A04**: Verify business logic restrictions
- **A05**: Review error messages and configurations

## Conclusion

WhoopsPay serves as a comprehensive educational platform for understanding web application security. By intentionally implementing common vulnerabilities, it provides a safe environment for learning and practicing security assessment techniques.

Remember: **This code is for educational purposes only. Never use these patterns in production applications.**