const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Mock product data
const products = [
  { id: 1, name: 'Apple Juice (1000ml)', price: 1.99, description: 'The all-time classic.' },
  { id: 2, name: 'Orange Juice (1000ml)', price: 2.99, description: 'Made from oranges hand-picked by Uncle Dittmeyer.' },
  { id: 3, name: 'Eggfruit Juice (500ml)', price: 8.99, description: 'Now with even more exotic flavour.' },
  { id: 4, name: 'Raspberry Juice (1000ml)', price: 4.99, description: 'Made from blended Raspberry Pi, water and sugar.' },
  { id: 5, name: 'Lemon Juice (500ml)', price: 2.49, description: 'Sour but full of vitamins.' }
];

// Mock basket data (in-memory for demo)
let baskets = {};

// Helper function to parse JSON body with size limits
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let totalLength = 0;
    const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB limit
    
    req.on('data', chunk => {
      totalLength += chunk.length;
      if (totalLength > MAX_BODY_SIZE) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk.toString();
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('aborted', () => {
      reject(new Error('Request aborted'));
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

// Helper function for secure basket access
function getSecureBasketItems(baskets, basketId) {
  if (Object.prototype.hasOwnProperty.call(baskets, basketId)) {
    return Object.getOwnPropertyDescriptor(baskets, basketId).value || [];
  }
  return [];
}

// Helper function to send JSON response with secure CORS
function sendJSON(res, data, status = 200, origin = 'http://localhost:5000') {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper function to serve static files with secure file access
function serveStatic(res, filePath) {
  // Secure whitelist of allowed files
  const allowedFiles = {
    'index.html': path.join(__dirname, 'public', 'index.html'),
    'style.css': path.join(__dirname, 'public', 'style.css'),
    'script.js': path.join(__dirname, 'public', 'script.js')
  };
  
  const fileName = path.basename(filePath);
  const safePath = Object.prototype.hasOwnProperty.call(allowedFiles, fileName) ? 
    Object.getOwnPropertyDescriptor(allowedFiles, fileName).value : null;
  
  if (!safePath) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  // Use explicit literal paths to prevent dynamic file access
  const indexPath = __dirname + '/public/index.html';
  const cssPath = __dirname + '/public/style.css';
  const jsPath = __dirname + '/public/script.js';
  
  if (safePath === path.join(__dirname, 'public', 'index.html')) {
    fs.readFile(indexPath, (err, data) => { // eslint-disable-line security/detect-non-literal-fs-filename
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.js') contentType = 'application/javascript';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  } else if (safePath === path.join(__dirname, 'public', 'style.css')) {
    fs.readFile(cssPath, (err, data) => { // eslint-disable-line security/detect-non-literal-fs-filename
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  } else if (safePath === path.join(__dirname, 'public', 'script.js')) {
    fs.readFile(jsPath, (err, data) => { // eslint-disable-line security/detect-non-literal-fs-filename
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight with secure origin policy
  const allowedOrigins = ['http://localhost:5000', 'http://localhost:3000'];
  const requestOrigin = req.headers.origin;
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : 'http://localhost:5000';
  
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // Routes
    if (pathname === '/' && method === 'GET') {
      serveStatic(res, path.join(__dirname, 'public', 'index.html'));
    }
    else if (pathname === '/api/Products' && method === 'GET') {
      sendJSON(res, { status: 'success', data: products }, 200, allowOrigin);
    }
    else if (pathname === '/api/BasketItems' && method === 'GET') {
      const basketId = parsedUrl.query.basketId || 'default';
      // Validate basketId to prevent object injection
      const safeBasketId = String(basketId).replace(/[^a-zA-Z0-9-_]/g, '');
      const basketItems = getSecureBasketItems(baskets, safeBasketId);
      sendJSON(res, { status: 'success', data: basketItems }, 200, allowOrigin);
    }
    else if (pathname === '/api/BasketItems' && method === 'POST') {
      const body = await parseBody(req);
      const { ProductId, quantity = 1, basketId = 'default' } = body;
      
      // Validate basketId to prevent object injection
      const safeBasketId = String(basketId).replace(/[^a-zA-Z0-9-_]/g, '');
      if (!Object.prototype.hasOwnProperty.call(baskets, safeBasketId)) {
        Object.defineProperty(baskets, safeBasketId, {
          value: [],
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
      
      const product = products.find(p => p.id === ProductId);
      if (!product) {
        sendJSON(res, { error: 'Product not found' }, 404, allowOrigin);
        return;
      }
      
      const basketArray = getSecureBasketItems(baskets, safeBasketId);
      const existingItem = basketArray.find(item => item.ProductId === ProductId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        basketArray.push({
          id: Date.now(),
          ProductId,
          quantity,
          product
        });
      }
      
      sendJSON(res, { status: 'success', data: { ProductId, quantity } }, 200, allowOrigin);
    }
    else if (pathname.startsWith('/api/BasketItems/') && method === 'DELETE') {
      const itemId = parseInt(pathname.split('/')[3]);
      const basketId = parsedUrl.query.basketId || 'default';
      
      // Validate basketId to prevent object injection
      const safeBasketId = String(basketId).replace(/[^a-zA-Z0-9-_]/g, '');
      if (Object.prototype.hasOwnProperty.call(baskets, safeBasketId)) {
        const currentItems = getSecureBasketItems(baskets, safeBasketId);
        const filteredItems = currentItems.filter(item => item.id !== itemId);
        Object.defineProperty(baskets, safeBasketId, {
          value: filteredItems,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
      
      sendJSON(res, { status: 'success' }, 200, allowOrigin);
    }
    else if (pathname === '/api/checkout' && method === 'POST') {
      const body = await parseBody(req);
      const { basketId = 'default', paymentMethod } = body;
      // Validate basketId to prevent object injection
      const safeBasketId = String(basketId).replace(/[^a-zA-Z0-9-_]/g, '');
      const basketItems = getSecureBasketItems(baskets, safeBasketId);
      
      if (basketItems.length === 0) {
        sendJSON(res, { error: 'Empty basket' }, 400, allowOrigin);
        return;
      }
      
      const total = basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const orderId = `JS-${Date.now()}`;
      
      // If WhoopsPay is selected, create payment request
      if (paymentMethod === 'whoopspay') {
        try {
          // Create payment request to WhoopsPay
          const paymentData = {
            toUserId: 'pending-user-selection',
            amount: total,
            externalOrderId: orderId,
            externalSource: 'juice-shop',
            description: `Juice Shop Order ${orderId} - ${basketItems.length} items`,
            returnUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard`,
            cancelUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard`
          };
          
          // Use http for local development, https would be used in production
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
                  // Clear basket after successful payment request
                  Object.defineProperty(baskets, safeBasketId, {
                    value: [],
                    writable: true,
                    enumerable: true,
                    configurable: true
                  });
                  sendJSON(res, { 
                    status: 'success', 
                    message: 'Payment request sent to WhoopsPay',
                    orderId: orderId,
                    total: total.toFixed(2),
                    paymentUrl: `${process.env.WHOOPSPAY_URL || 'http://localhost:5000'}/dashboard?orderId=${orderId}&returnTo=juice-shop`
                  }, 200, allowOrigin);
                } else {
                  sendJSON(res, { error: result.message || 'Payment failed' }, 400, allowOrigin);
                }
              } catch (parseError) {
                console.error('Payment response parse error:', parseError);
                sendJSON(res, { error: 'Payment service error' }, 500, allowOrigin);
              }
            });
          });
          
          whoopsPayReq.on('error', (error) => {
            console.error('Payment error:', error);
            sendJSON(res, { error: 'Payment service unavailable' }, 500, allowOrigin);
          });
          
          whoopsPayReq.write(postData);
          whoopsPayReq.end();
          
        } catch (error) {
          console.error('Payment error:', error);
          sendJSON(res, { error: 'Payment service unavailable' }, 500, allowOrigin);
        }
      } else {
        // Simulate other payment methods
        Object.defineProperty(baskets, safeBasketId, {
          value: [],
          writable: true,
          enumerable: true,
          configurable: true
        });
        sendJSON(res, { 
          status: 'success', 
          message: 'Order completed successfully',
          orderId: orderId,
          total: total.toFixed(2)
        }, 200, allowOrigin);
      }
    }
    else if (pathname === '/webhook/payment-status' && method === 'POST') {
      const body = await parseBody(req);
      const { orderId, status } = body;
      console.log(`Payment webhook received: Order ${orderId} - Status: ${status}`);
      
      sendJSON(res, { status: 'received' }, 200, allowOrigin);
    }
    else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, { error: 'Internal server error' }, 500, allowOrigin);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🧃 OWASP Juice Shop running on http://localhost:${PORT}`);
  console.log(`🔗 Integration with WhoopsPay available at http://localhost:5000`);
});