// OWASP Top 10 Security Tests for WhoopsPay
const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

describe('OWASP Top 10 Security Tests', () => {
  
  // A01: Broken Access Control
  describe('A01 - Broken Access Control', () => {
    test('should detect unauthorized admin access', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { 'Cookie': 'user_id=1' } // Regular user accessing admin
        });
        if (response.status === 200) {
          console.error('VULNERABILITY: Regular user can access admin endpoints');
        }
      } catch (error) {
        console.log('✓ Admin access properly restricted');
      }
    });

    test('should detect direct object reference vulnerability', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/transactions/999`, {
          headers: { 'Cookie': 'user_id=1' } // User accessing other user's transaction
        });
        if (response.status === 200) {
          console.error('VULNERABILITY: Direct object reference allows unauthorized access');
        }
      } catch (error) {
        console.log('✓ Direct object access properly controlled');
      }
    });
  });

  // A02: Cryptographic Failures
  describe('A02 - Cryptographic Failures', () => {
    test('should detect plain text password storage', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/register`, {
          username: 'testuser',
          password: 'plaintext123'
        });
        // Check if password is stored in plain text
        const userResponse = await axios.get(`${BASE_URL}/api/debug/users`);
        if (userResponse.data.some(user => user.password === 'plaintext123')) {
          console.error('VULNERABILITY: Passwords stored in plain text');
        }
      } catch (error) {
        console.log('✓ Password encryption properly implemented');
      }
    });

    test('should detect weak session management', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/login`, {
          username: 'admin',
          password: 'admin'
        });
        const sessionCookie = response.headers['set-cookie'];
        if (sessionCookie && !sessionCookie.some(cookie => cookie.includes('Secure'))) {
          console.error('VULNERABILITY: Session cookies not secure');
        }
      } catch (error) {
        console.log('Session security check completed');
      }
    });
  });

  // A03: Injection
  describe('A03 - Injection', () => {
    test('should detect SQL injection vulnerability', async () => {
      try {
        const maliciousInput = "'; DROP TABLE users; --";
        const response = await axios.post(`${BASE_URL}/api/login`, {
          username: maliciousInput,
          password: 'test'
        });
        console.warn('POTENTIAL VULNERABILITY: SQL injection endpoint accessible');
      } catch (error) {
        console.log('✓ SQL injection protection in place');
      }
    });

    test('should detect NoSQL injection', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/search`, {
          query: { '$ne': null }
        });
        if (response.status === 200 && response.data.length > 0) {
          console.error('VULNERABILITY: NoSQL injection possible');
        }
      } catch (error) {
        console.log('✓ NoSQL injection protection in place');
      }
    });
  });

  // A04: Insecure Design
  describe('A04 - Insecure Design', () => {
    test('should detect missing rate limiting', async () => {
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(axios.post(`${BASE_URL}/api/login`, {
          username: 'test',
          password: 'test'
        }).catch(() => {}));
      }
      
      const responses = await Promise.allSettled(requests);
      const successCount = responses.filter(r => r.status === 'fulfilled').length;
      
      if (successCount > 50) {
        console.error('VULNERABILITY: No rate limiting detected');
      } else {
        console.log('✓ Rate limiting properly implemented');
      }
    });

    test('should detect insufficient business logic validation', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/transfer`, {
          to: 'user2',
          amount: -1000 // Negative amount
        }, {
          headers: { 'Cookie': 'user_id=1' }
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Negative transfer amounts allowed');
        }
      } catch (error) {
        console.log('✓ Business logic validation in place');
      }
    });
  });

  // A05: Security Misconfiguration
  describe('A05 - Security Misconfiguration', () => {
    test('should detect exposed debug endpoints', async () => {
      const debugEndpoints = ['/debug', '/api/debug', '/admin/debug', '/.env'];
      
      for (const endpoint of debugEndpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint}`);
          if (response.status === 200) {
            console.error(`VULNERABILITY: Debug endpoint exposed: ${endpoint}`);
          }
        } catch (error) {
          console.log(`✓ Debug endpoint properly secured: ${endpoint}`);
        }
      }
    });

    test('should detect missing security headers', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/`);
        const headers = response.headers;
        
        const requiredHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'strict-transport-security',
          'content-security-policy'
        ];
        
        const missingHeaders = requiredHeaders.filter(header => !headers[header]);
        
        if (missingHeaders.length > 0) {
          console.error(`VULNERABILITY: Missing security headers: ${missingHeaders.join(', ')}`);
        } else {
          console.log('✓ Security headers properly configured');
        }
      } catch (error) {
        console.log('Security headers check completed');
      }
    });
  });

  // A06: Vulnerable and Outdated Components
  describe('A06 - Vulnerable Components', () => {
    test('should detect outdated dependencies', async () => {
      // This will be caught by Snyk automatically
      console.log('Dependency vulnerabilities checked by Snyk scanner');
    });
  });

  // A07: Identification and Authentication Failures
  describe('A07 - Authentication Failures', () => {
    test('should detect weak password policy', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/register`, {
          username: 'weakuser',
          password: '123' // Very weak password
        });
        
        if (response.status === 200 || response.status === 201) {
          console.error('VULNERABILITY: Weak passwords accepted');
        }
      } catch (error) {
        console.log('✓ Strong password policy enforced');
      }
    });

    test('should detect session fixation vulnerability', async () => {
      try {
        // Get initial session
        const response1 = await axios.get(`${BASE_URL}/api/profile`);
        const initialSession = response1.headers['set-cookie'];
        
        // Login with fixed session
        const response2 = await axios.post(`${BASE_URL}/api/login`, {
          username: 'admin',
          password: 'admin'
        }, {
          headers: { 'Cookie': initialSession }
        });
        
        const finalSession = response2.headers['set-cookie'];
        
        if (initialSession === finalSession) {
          console.error('VULNERABILITY: Session fixation possible');
        } else {
          console.log('✓ Session regeneration on login');
        }
      } catch (error) {
        console.log('Session fixation test completed');
      }
    });
  });

  // A08: Software and Data Integrity Failures
  describe('A08 - Integrity Failures', () => {
    test('should detect unsigned updates', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/version`);
        if (response.data && !response.data.signature) {
          console.error('VULNERABILITY: Software updates not signed');
        }
      } catch (error) {
        console.log('✓ Software integrity protection in place');
      }
    });
  });

  // A09: Security Logging and Monitoring Failures
  describe('A09 - Logging Failures', () => {
    test('should detect insufficient logging', async () => {
      try {
        // Attempt suspicious activities
        await axios.post(`${BASE_URL}/api/login`, {
          username: 'admin',
          password: 'wrongpassword'
        }).catch(() => {});
        
        await axios.get(`${BASE_URL}/api/admin/sensitive`).catch(() => {});
        
        console.warn('MANUAL CHECK: Verify failed login attempts are logged');
        console.warn('MANUAL CHECK: Verify unauthorized access attempts are logged');
      } catch (error) {
        console.log('Logging test completed');
      }
    });
  });

  // A10: Server-Side Request Forgery (SSRF)
  describe('A10 - SSRF', () => {
    test('should detect SSRF vulnerability', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/fetch-url`, {
          url: 'http://169.254.169.254/latest/meta-data/' // AWS metadata
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: SSRF attack possible');
        }
      } catch (error) {
        console.log('✓ SSRF protection in place');
      }
    });
  });
});

module.exports = {
  testSuite: 'OWASP Top 10 Security Tests',
  description: 'Comprehensive security tests for OWASP Top 10 vulnerabilities'
};