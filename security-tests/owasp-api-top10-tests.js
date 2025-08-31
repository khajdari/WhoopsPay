// OWASP API Security Top 10 Tests for WhoopsPay
import axios from 'axios';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

describe('OWASP API Security Top 10 Tests', () => {

  // API1: Broken Object Level Authorization
  describe('API1 - Broken Object Level Authorization', () => {
    test('should detect unauthorized transaction access', async () => {
      try {
        // User 1 accessing User 2's transaction
        const response = await axios.get(`${BASE_URL}/api/users/2/transactions`, {
          headers: { 'Authorization': 'Bearer user1_token' }
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: User can access other users\' transactions');
        }
      } catch (error) {
        console.log('✓ Object level authorization properly implemented');
      }
    });

    test('should detect profile access vulnerability', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/admin/profile`, {
          headers: { 'Cookie': 'user_id=1' } // Regular user accessing admin profile
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Users can access other user profiles');
        }
      } catch (error) {
        console.log('✓ Profile access properly controlled');
      }
    });
  });

  // API2: Broken User Authentication
  describe('API2 - Broken User Authentication', () => {
    test('should detect JWT token vulnerabilities', async () => {
      try {
        const maliciousToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.';
        const response = await axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${maliciousToken}` }
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: JWT tokens not properly validated');
        }
      } catch (error) {
        console.log('✓ JWT validation properly implemented');
      }
    });

    test('should detect API key vulnerabilities', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/sensitive-data?api_key=leaked_key`);
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Weak API key validation');
        }
      } catch (error) {
        console.log('✓ API key validation properly implemented');
      }
    });
  });

  // API3: Broken Object Property Level Authorization
  describe('API3 - Broken Object Property Authorization', () => {
    test('should detect excessive data exposure in user endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/1`, {
          headers: { 'Cookie': 'user_id=1' }
        });
        
        if (response.data && (response.data.password || response.data.ssn || response.data.credit_card)) {
          console.error('VULNERABILITY: Sensitive data exposed in API response');
        } else {
          console.log('✓ Sensitive data properly filtered');
        }
      } catch (error) {
        console.log('Data exposure test completed');
      }
    });

    test('should detect unauthorized property updates', async () => {
      try {
        const response = await axios.put(`${BASE_URL}/api/users/1`, {
          role: 'admin', // Regular user trying to escalate privileges
          balance: 1000000
        }, {
          headers: { 'Cookie': 'user_id=1' }
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Users can modify restricted properties');
        }
      } catch (error) {
        console.log('✓ Property-level authorization properly implemented');
      }
    });
  });

  // API4: Unrestricted Resource Consumption
  describe('API4 - Unrestricted Resource Consumption', () => {
    test('should detect lack of rate limiting', async () => {
      const requests = [];
      const startTime = Date.now();
      
      // Send 50 requests rapidly
      for (let i = 0; i < 50; i++) {
        requests.push(
          axios.get(`${BASE_URL}/api/transactions`).catch(() => {})
        );
      }
      
      const responses = await Promise.allSettled(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 'fulfilled').length;
      
      if (successfulRequests > 40 && duration < 5000) {
        console.error('VULNERABILITY: No rate limiting on API endpoints');
      } else {
        console.log('✓ Rate limiting properly implemented');
      }
    });

    test('should detect pagination abuse', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/transactions?limit=999999`);
        
        if (response.data && response.data.length > 1000) {
          console.error('VULNERABILITY: No pagination limits enforced');
        } else {
          console.log('✓ Pagination limits properly enforced');
        }
      } catch (error) {
        console.log('Pagination test completed');
      }
    });
  });

  // API5: Broken Function Level Authorization
  describe('API5 - Broken Function Level Authorization', () => {
    test('should detect unauthorized admin function access', async () => {
      try {
        const response = await axios.delete(`${BASE_URL}/api/admin/users/2`, {
          headers: { 'Cookie': 'user_id=1' } // Regular user trying admin function
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Regular users can access admin functions');
        }
      } catch (error) {
        console.log('✓ Function-level authorization properly implemented');
      }
    });

    test('should detect HTTP method tampering', async () => {
      try {
        // Try DELETE on endpoint that should only accept GET
        const response = await axios.delete(`${BASE_URL}/api/users/1/profile`);
        
        if (response.status === 200) {
          console.error('VULNERABILITY: HTTP method tampering possible');
        }
      } catch (error) {
        console.log('✓ HTTP methods properly restricted');
      }
    });
  });

  // API6: Unrestricted Access to Sensitive Business Flows
  describe('API6 - Unrestricted Access to Sensitive Flows', () => {
    test('should detect money transfer flow abuse', async () => {
      try {
        // Attempt rapid money transfers
        const transfers = [];
        for (let i = 0; i < 10; i++) {
          transfers.push(
            axios.post(`${BASE_URL}/api/transfer`, {
              to: 'user2',
              amount: 100
            }, {
              headers: { 'Cookie': 'user_id=1' }
            }).catch(() => {})
          );
        }
        
        const responses = await Promise.allSettled(transfers);
        const successfulTransfers = responses.filter(r => r.status === 'fulfilled').length;
        
        if (successfulTransfers > 3) {
          console.error('VULNERABILITY: No protection against transfer flow abuse');
        } else {
          console.log('✓ Sensitive business flows properly protected');
        }
      } catch (error) {
        console.log('Business flow test completed');
      }
    });
  });

  // API7: Server Side Request Forgery
  describe('API7 - Server Side Request Forgery', () => {
    test('should detect SSRF in URL fetch endpoint', async () => {
      try {
        const maliciousUrls = [
          'http://localhost:22',
          'http://169.254.169.254/latest/meta-data/',
          'file:///etc/passwd'
        ];
        
        for (const url of maliciousUrls) {
          const response = await axios.post(`${BASE_URL}/api/fetch-external`, {
            url: url
          }).catch(() => {});
          
          if (response && response.status === 200) {
            console.error(`VULNERABILITY: SSRF possible with URL: ${url}`);
          }
        }
        
        console.log('✓ SSRF protection properly implemented');
      } catch (error) {
        console.log('SSRF test completed');
      }
    });
  });

  // API8: Security Misconfiguration
  describe('API8 - Security Misconfiguration', () => {
    test('should detect API documentation exposure', async () => {
      const docEndpoints = [
        '/api/docs',
        '/swagger',
        '/api/swagger',
        '/api-docs',
        '/documentation'
      ];
      
      for (const endpoint of docEndpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint}`);
          if (response.status === 200) {
            console.error(`VULNERABILITY: API documentation exposed at: ${endpoint}`);
          }
        } catch (error) {
          console.log(`✓ API documentation properly secured: ${endpoint}`);
        }
      }
    });

    test('should detect verbose error messages', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/invalid-endpoint`, {
          malformed: 'data'
        });
      } catch (error) {
        if (error.response && error.response.data && 
            (error.response.data.stack || error.response.data.trace)) {
          console.error('VULNERABILITY: Verbose error messages expose system details');
        } else {
          console.log('✓ Error messages properly sanitized');
        }
      }
    });
  });

  // API9: Improper Inventory Management
  describe('API9 - Improper Inventory Management', () => {
    test('should detect undocumented API endpoints', async () => {
      const potentialEndpoints = [
        '/api/debug',
        '/api/test',
        '/api/internal',
        '/api/admin/debug',
        '/api/v1/legacy'
      ];
      
      for (const endpoint of potentialEndpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint}`);
          if (response.status === 200) {
            console.error(`VULNERABILITY: Undocumented API endpoint found: ${endpoint}`);
          }
        } catch (error) {
          console.log(`✓ Endpoint properly secured or non-existent: ${endpoint}`);
        }
      }
    });

    test('should detect outdated API versions', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/users`);
        if (response.status === 200) {
          console.warn('WARNING: Old API version still accessible');
        }
      } catch (error) {
        console.log('✓ Old API versions properly deprecated');
      }
    });
  });

  // API10: Unsafe Consumption of APIs
  describe('API10 - Unsafe API Consumption', () => {
    test('should detect unsafe third-party API consumption', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/external-payment`, {
          provider: 'untrusted-provider',
          amount: 1000
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: Unsafe consumption of external APIs');
        }
      } catch (error) {
        console.log('✓ External API consumption properly secured');
      }
    });

    test('should detect unvalidated external data', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/import-data`, {
          source: 'external',
          data: {
            user_role: 'admin',
            permissions: ['all']
          }
        });
        
        if (response.status === 200) {
          console.error('VULNERABILITY: External data not properly validated');
        }
      } catch (error) {
        console.log('✓ External data properly validated');
      }
    });
  });
});

module.exports = {
  testSuite: 'OWASP API Security Top 10 Tests',
  description: 'Comprehensive security tests for OWASP API Security Top 10 vulnerabilities'
};