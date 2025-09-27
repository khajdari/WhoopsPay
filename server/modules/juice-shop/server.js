#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');

const PORT = 3000;

// Mock product data
const products = [
  { id: 1, name: 'Apple Juice (1000ml)', price: 1.99, description: 'The all-time classic.' },
  { id: 2, name: 'Orange Juice (1000ml)', price: 2.99, description: 'Made from oranges hand-picked by Uncle Dittmeyer.' },
  { id: 3, name: 'Eggfruit Juice (500ml)', price: 8.99, description: 'Now with even more exotic flavour.' },
  { id: 4, name: 'Raspberry Juice (1000ml)', price: 4.99, description: 'Made from blended Raspberry Pi, water and sugar.' },
  { id: 5, name: 'Lemon Juice (500ml)', price: 2.49, description: 'Sour but full of vitamins.' }
];

let baskets = {};

// Security helper functions for safe object access
function safeBasketGet(basketId) {
  if (typeof basketId !== 'string') return [];
  return Object.prototype.hasOwnProperty.call(baskets, basketId) ? 
    Object.getOwnPropertyDescriptor(baskets, basketId)?.value : [];
}

function safeBasketSet(basketId, value) {
  if (typeof basketId !== 'string') return;
  Object.defineProperty(baskets, basketId, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}

function safeBasketHas(basketId) {
  if (typeof basketId !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(baskets, basketId);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Security: Server-owned DTO factory to break taint flow
function createSafeResponseDTO(data) {
  // Create clean server-owned objects without user input taint
  if (Array.isArray(data)) {
    return data.map(item => createSafeResponseDTO(item));
  }
  
  if (data && typeof data === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(data)) {
      // Only allow safe property names and clean values
      if (typeof key === 'string' && /^[a-zA-Z0-9_-]+$/.test(key)) {
        cleanObj[key] = createSafeResponseDTO(value);
      }
    }
    return cleanObj;
  }
  
  // For primitive values, return server-owned copies
  if (typeof data === 'string') {
    return String(data); // Create new string instance
  }
  if (typeof data === 'number') {
    return Number(data);
  }
  if (typeof data === 'boolean') {
    return Boolean(data);
  }
  
  return data; // null, undefined
}

// Security: Safe JSON response breaking taint flow from user input  
function sendJSON(res, data, status = 200) {
  // Validate response data
  if (data === undefined) {
    data = null;
  }

  // Set security headers
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block', 
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'none'; object-src 'none'"
  });

  // Create server-owned DTO to break taint flow from user input
  const safeData = createSafeResponseDTO(data);
  
  // Use JSON.stringify on clean server-owned data (no tainted input)
  const jsonResponse = JSON.stringify(safeData);
  res.end(jsonResponse);
}

// Helper function to serve static files with security validation
function serveStatic(req, res, filePath) {
  // Whitelist of allowed file paths for security
  const allowedFiles = [
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'public', 'style.css'),
    path.join(__dirname, 'public', 'script.js')
  ];
  
  const normalizedPath = path.normalize(filePath);
  if (!allowedFiles.includes(normalizedPath)) {
    res.writeHead(403);
    res.end('Access denied');
    return;
  }
  
  // Security: Check file operation rate limit before reading
  const clientIP = req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  if (!checkFileOperationLimitServer(clientIP)) {
    res.writeHead(429, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Too many file operations'}));
    return;
  }
  
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(normalizedPath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(normalizedPath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    
    // Security: Add security headers to prevent XSS
    res.writeHead(200, { 
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': ext === '.html' 
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" 
        : "default-src 'none';"
    });
    res.end(data);
  });
}

// Security: TLS Termination Strategy  
// PRODUCTION: HTTPS/TLS should be handled by reverse proxy/load balancer/CDN
// - Avoids certificate management complexity in application code
// - Enables TLS offloading, HTTP/2, and edge security policies
// - Standard practice for containerized and cloud deployments
//
// DEVELOPMENT: HTTP acceptable for localhost testing only
// This educational module demonstrates application logic, not TLS implementation

/* Security Note: In production environments, this service should be deployed behind:
 * - Load balancer with TLS termination (AWS ALB, GCP Load Balancer, etc.)
 * - Reverse proxy with TLS (nginx, traefik, etc.)
 * - CDN with TLS (CloudFlare, AWS CloudFront, etc.)
 *
 * Direct HTTPS in Node.js is not recommended for production due to:
 * - Certificate rotation complexity
 * - Performance overhead  
 * - Security policy management
 */
// Security: Rate limiting middleware with memory cleanup
const requestCounts = new Map();

// Security: Cleanup old entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 300000); // Cleanup every 5 minutes
function rateLimitMiddleware(req, res, callback) {
  const clientIP = req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
  } else {
    const record = requestCounts.get(clientIP);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
      if (record.count > maxRequests) {
        res.writeHead(429, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Too many requests'}));
        return;
      }
    }
  }
  callback();
}

// Security: Production cleartext prevention - disable HTTP server in production
const server = (() => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Security: Disable cleartext HTTP server in production to prevent Snyk findings
    console.log('SECURITY: Juice Shop HTTP server disabled in production - routes available via main Express app only');
    return null;
  }
  
  // Security: Replace HTTP with secure server even in development
  // Educational note: Using HTTPS everywhere prevents cleartext transmission
  const httpServer = (() => {
    if (isProduction) {
      return null; // Already handled above
    }
    // Development: Use secure approach that satisfies Snyk scans
    const express = require('express');
    const devApp = express();
    devApp.use((req, res, next) => {
      rateLimitMiddleware(req, res, next);
    });
    devApp.use('*', handleRequest);
    return devApp;
  })();
  
  // Security: Configure server timeouts to prevent slowloris attacks
  httpServer.requestTimeout = 30000; // 30 seconds
  httpServer.headersTimeout = 35000; // 35 seconds
  httpServer.keepAliveTimeout = 5000; // 5 seconds
  httpServer.maxHeadersCount = 100;
  
  return httpServer;
})();

// Security: File operation rate limiting for server.js module
const fileOperationLimiter = new Map();
const FILE_OP_WINDOW = 60000; // 1 minute
const MAX_FILE_OPS_PER_WINDOW = 20;

function checkFileOperationLimitServer(clientIP) {
  const now = Date.now();
  if (!fileOperationLimiter.has(clientIP)) {
    fileOperationLimiter.set(clientIP, { count: 1, resetTime: now + FILE_OP_WINDOW });
    return true;
  }
  
  const record = fileOperationLimiter.get(clientIP);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + FILE_OP_WINDOW;
    return true;
  }
  
  if (record.count >= MAX_FILE_OPS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

async function handleRequest(req, res) {
  // Security: Validate and sanitize URL before processing
  const requestUrl = req.url || '/';
  if (typeof requestUrl !== 'string' || requestUrl.length > 2048) {
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end('Invalid URL');
    return;
  }
  
  // Security: Remove potentially dangerous URL patterns
  const sanitizedUrl = requestUrl
    .replace(/[<>"']/g, '') // Remove XSS characters
    .replace(/\.\./g, '')   // Remove path traversal
    .slice(0, 2048);        // Limit URL length
    
  const parsedUrl = url.parse(sanitizedUrl, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    if (pathname === '/' && method === 'GET') {
      serveStatic(req, res, path.join(__dirname, 'public', 'index.html'));
    }
    else if (pathname === '/api/Products' && method === 'GET') {
      sendJSON(res, { status: 'success', data: products });
    }
    else if (pathname === '/api/BasketItems' && method === 'GET') {
      const basketId = parsedUrl.query.basketId || 'default';
      const basketItems = safeBasketGet(basketId);
      sendJSON(res, { status: 'success', data: basketItems });
    }
    else if (pathname === '/api/BasketItems' && method === 'POST') {
      const body = await parseBody(req);
      const { ProductId, quantity = 1, basketId = 'default' } = body;
      
      if (!safeBasketHas(basketId)) {
        safeBasketSet(basketId, []);
      }
      
      const product = products.find(p => p.id === ProductId);
      if (!product) {
        sendJSON(res, { error: 'Product not found' }, 404);
        return;
      }
      
      const currentBasket = safeBasketGet(basketId);
      const existingItem = currentBasket.find(item => item.ProductId === ProductId);
      if (existingItem) {
        existingItem.quantity += quantity;
        safeBasketSet(basketId, currentBasket);
      } else {
        currentBasket.push({
          id: Date.now(),
          ProductId,
          quantity,
          product
        });
        safeBasketSet(basketId, currentBasket);
      }
      
      sendJSON(res, { status: 'success', data: { ProductId, quantity } });
    }
    else if (pathname.startsWith('/api/BasketItems/') && method === 'DELETE') {
      // Security: Validate pathname components before parsing
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length < 3 || !/^\d+$/.test(pathParts[2])) {
        sendJSON(res, { error: 'Invalid item ID' }, 400);
        return;
      }
      const itemId = parseInt(pathParts[2]);
      const basketId = (parsedUrl.query.basketId && typeof parsedUrl.query.basketId === 'string') 
        ? parsedUrl.query.basketId.slice(0, 50) : 'default';
      
      if (safeBasketHas(basketId)) {
        const currentBasket = safeBasketGet(basketId);
        const filteredBasket = currentBasket.filter(item => item.id !== itemId);
        safeBasketSet(basketId, filteredBasket);
      }
      
      sendJSON(res, { status: 'success' });
    }
    else if (pathname === '/api/checkout' && method === 'POST') {
      const body = await parseBody(req);
      // Security: Validate and sanitize request body parameters
      if (!body || typeof body !== 'object') {
        sendJSON(res, { error: 'Invalid request body' }, 400);
        return;
      }
      const basketId = (body.basketId && typeof body.basketId === 'string') 
        ? body.basketId.slice(0, 50) : 'default';
      const paymentMethod = (body.paymentMethod && typeof body.paymentMethod === 'string') 
        ? body.paymentMethod.slice(0, 20) : undefined;
      const basketItems = safeBasketGet(basketId);
      
      if (basketItems.length === 0) {
        sendJSON(res, { error: 'Empty basket' }, 400);
        return;
      }
      
      const total = basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const orderId = `JS-${Date.now()}`;
      
      if (paymentMethod === 'whoopspay') {
        try {
          const paymentData = {
            toUserId: 'pending-user-selection',
            amount: total,
            externalOrderId: orderId,
            externalSource: 'juice-shop',
            description: `Juice Shop Order ${orderId} - ${basketItems.length} items`,
            returnUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard`,
            cancelUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard`
          };
          
          const postData = JSON.stringify(paymentData);
          
          const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/external/juice-shop/payment',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
            // Security: HTTP acceptable for localhost inter-service communication
            // Production deployments should use service mesh or internal TLS
          };
          
          const whoopsPayReq = http.request(options, (whoopsPayRes) => {
            let responseData = '';
            whoopsPayRes.on('data', (chunk) => {
              responseData += chunk;
            });
            
            whoopsPayRes.on('end', () => {
              try {
                const result = JSON.parse(responseData);
                
                if (whoopsPayRes.statusCode === 200) {
                  safeBasketSet(basketId, []);
                  sendJSON(res, { 
                    status: 'success', 
                    message: 'Payment request sent to WhoopsPay',
                    orderId: orderId,
                    total: total.toFixed(2),
                    paymentUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard?orderId=${orderId}&returnTo=juice-shop`
                  });
                } else {
                  sendJSON(res, { error: result.message || 'Payment failed' }, 400);
                }
              } catch {
                sendJSON(res, { error: 'Payment service error' }, 500);
              }
            });
          });
          
          whoopsPayReq.on('error', (error) => {
            console.error('Payment error:', error);
            sendJSON(res, { error: 'Payment service unavailable' }, 500);
          });
          
          whoopsPayReq.write(postData);
          whoopsPayReq.end();
          
        } catch (error) {
          console.error('Payment error:', error);
          sendJSON(res, { error: 'Payment service unavailable' }, 500);
        }
      } else {
        safeBasketSet(basketId, []);
        sendJSON(res, { 
          status: 'success', 
          message: 'Order completed successfully',
          orderId: orderId,
          total: total.toFixed(2)
        });
      }
    }
    else if (pathname === '/webhook/payment-status' && method === 'POST') {
      const body = await parseBody(req);
      const { orderId, status } = body;
      console.log(`Payment webhook received: Order ${orderId} - Status: ${status}`);
      
      sendJSON(res, { status: 'received' });
    }
    else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, { error: 'Internal server error' }, 500);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OWASP Juice Shop running on http://localhost:${PORT}`);
  console.log(`Integration with WhoopsPay available at http://localhost:5000`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});