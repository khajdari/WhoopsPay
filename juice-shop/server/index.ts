import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for Juice Shop products
const products = [
  {
    id: 1,
    name: "Apple Pomace",
    price: 0.89,
    description: "Fiber-rich apple pomace is what remains after processing apple juice",
    image: "🍎",
    category: "Fruits",
    inStock: true
  },
  {
    id: 2,
    name: "Carrot Juice",
    price: 2.99,
    description: "Fresh carrot juice packed with vitamins",
    image: "🥕",
    category: "Vegetables", 
    inStock: false
  },
  {
    id: 3,
    name: "Green Smoothie",
    price: 4.50,
    description: "Healthy green smoothie with spinach and kale",
    image: "🥬",
    category: "Smoothies",
    inStock: true
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Cart simulation endpoints
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (!product.inStock) {
    return res.status(400).json({ error: 'Product out of stock' });
  }
  
  res.json({
    success: true,
    message: 'Product added to cart',
    item: {
      ...product,
      quantity
    }
  });
});

// Payment initiation endpoint
app.post('/api/payment/initiate', (req, res) => {
  const { amount, items, currency = 'USD' } = req.body;
  
  if (!amount || !items) {
    return res.status(400).json({ error: 'Amount and items are required' });
  }
  
  // Generate payment session
  const paymentSession = {
    id: `js_${Date.now()}`,
    amount,
    currency,
    items,
    status: 'pending',
    redirectUrl: `http://localhost:5000/external-payment-redirect?amount=${amount}&description=Juice Shop Purchase&source=juice-shop&returnUrl=${encodeURIComponent('http://localhost:3001/?status=success')}&cancelUrl=${encodeURIComponent('http://localhost:3001/?status=cancelled')}`,
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    session: paymentSession
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'OWASP Juice Shop',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🥤 OWASP Juice Shop running on port ${PORT}`);
  console.log(`🔗 Integrated with WhoopsPay at http://localhost:5000`);
});