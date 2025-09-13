#!/usr/bin/env node
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

let baskets = {};

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

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
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
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
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
      serveStatic(res, path.join(__dirname, 'public', 'index.html'));
    }
    else if (pathname === '/api/Products' && method === 'GET') {
      sendJSON(res, { status: 'success', data: products });
    }
    else if (pathname === '/api/BasketItems' && method === 'GET') {
      const basketId = parsedUrl.query.basketId || 'default';
      const basketItems = baskets[basketId] || [];
      sendJSON(res, { status: 'success', data: basketItems });
    }
    else if (pathname === '/api/BasketItems' && method === 'POST') {
      const body = await parseBody(req);
      const { ProductId, quantity = 1, basketId = 'default' } = body;
      
      if (!baskets[basketId]) {
        baskets[basketId] = [];
      }
      
      const product = products.find(p => p.id === ProductId);
      if (!product) {
        sendJSON(res, { error: 'Product not found' }, 404);
        return;
      }
      
      const existingItem = baskets[basketId].find(item => item.ProductId === ProductId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        baskets[basketId].push({
          id: Date.now(),
          ProductId,
          quantity,
          product
        });
      }
      
      sendJSON(res, { status: 'success', data: { ProductId, quantity } });
    }
    else if (pathname.startsWith('/api/BasketItems/') && method === 'DELETE') {
      const itemId = parseInt(pathname.split('/')[3]);
      const basketId = parsedUrl.query.basketId || 'default';
      
      if (baskets[basketId]) {
        baskets[basketId] = baskets[basketId].filter(item => item.id !== itemId);
      }
      
      sendJSON(res, { status: 'success' });
    }
    else if (pathname === '/api/checkout' && method === 'POST') {
      const body = await parseBody(req);
      const { basketId = 'default', paymentMethod } = body;
      const basketItems = baskets[basketId] || [];
      
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
                  baskets[basketId] = [];
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
              } catch (error) {
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
        baskets[basketId] = [];
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
      const { orderId, status, transactionId } = body;
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