const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Sample products for Juice Shop
const products = [
  {
    id: 1,
    name: "Apple Pomace",
    description: "Finest pressings of apples. Allergy disclaimer: Might contain traces of worms. Can be sent for recycling.",
    price: 0.89,
    image: "🍎",
    inStock: true
  },
  {
    id: 2,
    name: "Carrot Juice",
    description: "As the old German saying goes: \"Carrots are good for the eyes. Or has anyone ever seen a rabbit with glasses?\"",
    price: 2.99,
    image: "🥕",
    inStock: false
  },
  {
    id: 3,
    name: "Green Smoothie",
    description: "Looks poisonous but is surprisingly good!",
    price: 1.99,
    image: "🥤",
    inStock: true
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/payment/initiate', (req, res) => {
  const { items, total } = req.body;
  
  // Create payment session
  const paymentId = Date.now();
  const returnUrl = `http://localhost:3001/?payment=success&id=${paymentId}`;
  const cancelUrl = `http://localhost:3001/?payment=cancelled&id=${paymentId}`;
  
  // Redirect to WhoopsPay external payment
  const whoopsPayUrl = `http://localhost:5000/external-payment/${paymentId}?amount=${total}&description=Juice Shop Order&returnUrl=${encodeURIComponent(returnUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;
  
  res.json({
    success: true,
    redirectUrl: whoopsPayUrl,
    paymentId
  });
});

// Serve the HTML page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OWASP Juice Shop</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .status-message {
            text-align: center;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-weight: bold;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .product-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        .product-card.out-of-stock {
            opacity: 0.6;
            background: #f8f9fa;
        }
        
        .product-card.out-of-stock::before {
            content: "OUT OF STOCK";
            position: absolute;
            top: 15px;
            right: -30px;
            background: #dc3545;
            color: white;
            padding: 5px 40px;
            font-size: 12px;
            font-weight: bold;
            transform: rotate(45deg);
        }
        
        .product-emoji {
            font-size: 4rem;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .product-name {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .product-description {
            color: #666;
            line-height: 1.5;
            margin-bottom: 15px;
            font-size: 0.9rem;
        }
        
        .product-price {
            font-size: 1.8rem;
            font-weight: bold;
            color: #27ae60;
            margin-bottom: 15px;
        }
        
        .add-to-cart-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .add-to-cart-btn:hover:not(:disabled) {
            background: linear-gradient(45deg, #ee5a52, #ff6b6b);
            transform: scale(1.05);
        }
        
        .add-to-cart-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .cart {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: sticky;
            top: 20px;
        }
        
        .cart-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c3e50;
            text-align: center;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .cart-item:last-child {
            border-bottom: none;
        }
        
        .cart-total {
            font-size: 1.3rem;
            font-weight: bold;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #3498db;
            text-align: center;
            color: #2c3e50;
        }
        
        .checkout-btn {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
            width: 100%;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        
        .checkout-btn:hover:not(:disabled) {
            background: linear-gradient(45deg, #2980b9, #3498db);
            transform: scale(1.05);
        }
        
        .checkout-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .remove-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 15px;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .remove-btn:hover {
            background: #c0392b;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧃 OWASP Juice Shop</h1>
            <p>Probably the most modern and sophisticated insecure web application</p>
        </div>
        
        <div id="statusMessage"></div>
        
        <div class="products-grid" id="productsGrid">
            <!-- Products will be loaded here -->
        </div>
        
        <div class="cart">
            <div class="cart-title">🛒 Shopping Cart</div>
            <div id="cartItems"></div>
            <div class="cart-total" id="cartTotal">Total: $0.00</div>
            <button class="checkout-btn" id="checkoutBtn" onclick="checkout()" disabled>
                Pay with WhoopsPay
            </button>
        </div>
    </div>

    <script>
        let products = [];
        let cart = [];
        
        // Check for payment status in URL
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        
        if (paymentStatus) {
            const statusDiv = document.getElementById('statusMessage');
            if (paymentStatus === 'success') {
                statusDiv.innerHTML = '<div class="status-message status-success">✅ Payment successful! Thank you for your purchase.</div>';
                // Clear cart on successful payment
                cart = [];
                updateCart();
            } else if (paymentStatus === 'cancelled') {
                statusDiv.innerHTML = '<div class="status-message status-error">❌ Payment was cancelled. Your items are still in your cart.</div>';
            }
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                products = await response.json();
                renderProducts();
            } catch (error) {
                console.error('Failed to load products:', error);
            }
        }
        
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = products.map(product => `
                <div class="product-card ${!product.inStock ? 'out-of-stock' : ''}">
                    <div class="product-emoji">${product.image}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" 
                            onclick="addToCart(${product.id})" 
                            ${!product.inStock ? 'disabled' : ''}>
                        ${!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            `).join('');
        }
        
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (product && product.inStock) {
                const existingItem = cart.find(item => item.id === productId);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                updateCart();
            }
        }
        
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCart();
        }
        
        function updateCart() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
                cartTotal.textContent = 'Total: $0.00';
                checkoutBtn.disabled = true;
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>
                            $${(item.price * item.quantity).toFixed(2)}
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </span>
                    </div>
                `).join('');
                
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                cartTotal.textContent = `Total: $${total.toFixed(2)}`;
                checkoutBtn.disabled = false;
            }
        }
        
        async function checkout() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            try {
                const response = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: cart,
                        total: total
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Redirect to WhoopsPay
                    window.location.href = result.redirectUrl;
                } else {
                    alert('Payment initiation failed. Please try again.');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Payment initiation failed. Please try again.');
            }
        }
        
        // Load products when page loads
        loadProducts();
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Juice Shop server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});