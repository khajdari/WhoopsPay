const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock product data
const products = [
  { id: 1, name: 'Apple Juice (1000ml)', price: 1.99, image: '/images/apple_juice.jpg', description: 'The all-time classic.' },
  { id: 2, name: 'Orange Juice (1000ml)', price: 2.99, image: '/images/orange_juice.jpg', description: 'Made from oranges hand-picked by Uncle Dittmeyer.' },
  { id: 3, name: 'Eggfruit Juice (500ml)', price: 8.99, image: '/images/eggfruit_juice.jpg', description: 'Now with even more exotic flavour.' },
  { id: 4, name: 'Raspberry Juice (1000ml)', price: 4.99, image: '/images/raspberry_juice.jpg', description: 'Made from blended Raspberry Pi, water and sugar.' },
  { id: 5, name: 'Lemon Juice (500ml)', price: 2.49, image: '/images/lemon_juice.jpg', description: 'Sour but full of vitamins.' }
];

// Mock basket data (in-memory for demo)
let baskets = {};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/Products', (req, res) => {
  res.json({ status: 'success', data: products });
});

app.get('/api/BasketItems', (req, res) => {
  const basketId = req.query.basketId || 'default';
  const basketItems = baskets[basketId] || [];
  res.json({ status: 'success', data: basketItems });
});

app.post('/api/BasketItems', (req, res) => {
  const { ProductId, quantity = 1, basketId = 'default' } = req.body;
  
  if (!baskets[basketId]) {
    baskets[basketId] = [];
  }
  
  const product = products.find(p => p.id === ProductId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
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
  
  res.json({ status: 'success', data: { ProductId, quantity } });
});

app.delete('/api/BasketItems/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const basketId = req.query.basketId || 'default';
  
  if (baskets[basketId]) {
    baskets[basketId] = baskets[basketId].filter(item => item.id !== itemId);
  }
  
  res.json({ status: 'success' });
});

app.post('/api/checkout', async (req, res) => {
  const { basketId = 'default', paymentMethod } = req.body;
  const basketItems = baskets[basketId] || [];
  
  if (basketItems.length === 0) {
    return res.status(400).json({ error: 'Empty basket' });
  }
  
  const total = basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const orderId = `JS-${Date.now()}`;
  
  // If WhoopsPay is selected, create payment request
  if (paymentMethod === 'whoopspay') {
    try {
      // Create payment request to WhoopsPay
      const paymentData = {
        userId: '@james_chen', // Default user for demo
        amount: total,
        orderId: orderId,
        description: `Juice Shop Order ${orderId} - ${basketItems.length} items`
      };
      
      const response = await fetch('http://localhost:5000/api/external/juice-shop/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Clear basket after successful payment request
        baskets[basketId] = [];
        res.json({ 
          status: 'success', 
          message: 'Payment request sent to WhoopsPay',
          orderId: orderId,
          total: total.toFixed(2),
          paymentUrl: `http://localhost:5000/dashboard?highlight=${result.transactionId}`
        });
      } else {
        res.status(400).json({ error: result.message || 'Payment failed' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ error: 'Payment service unavailable' });
    }
  } else {
    // Simulate other payment methods
    baskets[basketId] = [];
    res.json({ 
      status: 'success', 
      message: 'Order completed successfully',
      orderId: orderId,
      total: total.toFixed(2)
    });
  }
});

// Webhook endpoint for WhoopsPay payment status updates
app.post('/webhook/payment-status', (req, res) => {
  const { orderId, status, transactionId } = req.body;
  console.log(`Payment webhook received: Order ${orderId} - Status: ${status}`);
  
  // In a real application, you would update the order status in your database
  res.json({ status: 'received' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧃 OWASP Juice Shop running on http://localhost:${PORT}`);
  console.log(`🔗 Integration with WhoopsPay available at http://localhost:5000`);
});