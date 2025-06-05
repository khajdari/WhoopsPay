const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(__dirname));

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
    name: "Banana Juice (1000ml)",
    description: "Monkeys love it the most.",
    price: 1.99,
    image: "🍌",
    inStock: true
  },
  {
    id: 4,
    name: "Eggfruit Juice",
    description: "Now with even more exotic flavour.",
    price: 8.99,
    image: "🥚",
    inStock: true
  },
  {
    id: 5,
    name: "Green Smoothie",
    description: "Looks poisonous but is actually very good for your health! Made from green vegetables.",
    price: 6.99,
    image: "🥬",
    inStock: true
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  console.log('Products requested');
  res.json(products);
});

app.post('/api/payment/initiate', async (req, res) => {
  try {
    console.log('Payment initiation received:', req.body);
    const { items, total } = req.body;
    
    // Forward to WhoopsPay
    const response = await fetch('http://localhost:5000/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items, total })
    });
    
    const result = await response.json();
    console.log('WhoopsPay response:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment initiation failed'
    });
  }
});

// Serve main page
app.get('/', (req, res) => {
  const paymentStatus = req.query.payment;
  let statusMessage = '';
  
  if (paymentStatus === 'success') {
    statusMessage = '<div style="background: #d4edda; color: #155724; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #c3e6cb;">✅ Payment successful! Thank you for your purchase.</div>';
  } else if (paymentStatus === 'cancelled') {
    statusMessage = '<div style="background: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #f5c6cb;">❌ Payment was cancelled. Your items are still in your cart.</div>';
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OWASP Juice Shop</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 3rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .products-section { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
        .product-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background: #fafafa; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .product-image { font-size: 3rem; text-align: center; margin-bottom: 15px; }
        .product-name { font-weight: bold; color: #333; margin-bottom: 8px; font-size: 1.1rem; }
        .product-description { color: #666; font-size: 0.9rem; margin-bottom: 15px; line-height: 1.4; }
        .product-price { font-size: 1.3rem; font-weight: bold; color: #e74c3c; margin-bottom: 15px; }
        .add-to-cart-btn { width: 100%; padding: 10px; background: linear-gradient(45deg, #4CAF50, #45a049); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: background 0.3s ease; }
        .add-to-cart-btn:hover { background: linear-gradient(45deg, #45a049, #4CAF50); }
        .add-to-cart-btn:disabled { background: #ccc; cursor: not-allowed; }
        .cart-section { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); height: fit-content; }
        .cart-header { font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
        .cart-item:last-child { border-bottom: none; }
        .item-details { flex: 1; }
        .item-name { font-weight: bold; color: #333; }
        .item-quantity { color: #666; font-size: 0.9rem; }
        .item-price { font-weight: bold; color: #e74c3c; }
        .remove-btn { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.8rem; }
        .remove-btn:hover { background: #c0392b; }
        .cart-total { font-size: 1.3rem; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .checkout-btn { width: 100%; padding: 15px; background: linear-gradient(45deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: bold; transition: all 0.3s ease; }
        .checkout-btn:hover:not(:disabled) { background: linear-gradient(45deg, #2980b9, #3498db); transform: scale(1.05); }
        .checkout-btn:disabled { background: #ccc; cursor: not-allowed; }
        .quantity-controls { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
        .quantity-btn { width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px; }
        .quantity-btn:hover { background: #f0f0f0; }
        .empty-cart { text-align: center; color: #666; font-style: italic; padding: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧃 OWASP Juice Shop</h1>
            <p>Probably the most modern and sophisticated insecure web application</p>
        </div>
        
        ${statusMessage}
        
        <div class="main-content">
            <div class="products-section">
                <h2>Products</h2>
                <div class="products-grid" id="productsGrid">
                    <!-- Products will be loaded here -->
                </div>
            </div>
            
            <div class="cart-section">
                <div class="cart-header">🛒 Shopping Cart</div>
                <div id="cartItems" class="empty-cart">Your cart is empty</div>
                <div id="cartTotal" class="cart-total">Total: $0.00</div>
                <button class="checkout-btn" id="checkoutBtn" onclick="checkout()" disabled>
                    Pay with WhoopsPay
                </button>
            </div>
        </div>
    </div>

    <script>
        let products = [];
        let cart = [];
        
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                products = await response.json();
                displayProducts();
            } catch (error) {
                console.error('Error loading products:', error);
            }
        }
        
        function displayProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = products.map(product => 
                '<div class="product-card">' +
                    '<div class="product-image">' + product.image + '</div>' +
                    '<div class="product-name">' + product.name + '</div>' +
                    '<div class="product-description">' + product.description + '</div>' +
                    '<div class="product-price">$' + product.price.toFixed(2) + '</div>' +
                    '<button class="add-to-cart-btn" onclick="addToCart(' + product.id + ')" ' + 
                    (product.inStock ? '' : 'disabled') + '>' +
                    (product.inStock ? 'Add to Cart' : 'Out of Stock') +
                    '</button>' +
                '</div>'
            ).join('');
        }
        
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            updateCart();
        }
        
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCart();
        }
        
        function updateQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    updateCart();
                }
            }
        }
        
        function updateCart() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                cartTotal.textContent = 'Total: $0.00';
                checkoutBtn.disabled = true;
            } else {
                cartItems.innerHTML = cart.map(item => 
                    '<div class="cart-item">' +
                        '<div class="item-details">' +
                            '<div class="item-name">' + item.name + '</div>' +
                            '<div class="item-quantity">Quantity: ' + item.quantity + '</div>' +
                            '<div class="quantity-controls">' +
                                '<button class="quantity-btn" onclick="updateQuantity(' + item.id + ', -1)">-</button>' +
                                '<span>' + item.quantity + '</span>' +
                                '<button class="quantity-btn" onclick="updateQuantity(' + item.id + ', 1)">+</button>' +
                            '</div>' +
                        '</div>' +
                        '<div>' +
                            '<div class="item-price">$' + (item.price * item.quantity).toFixed(2) + '</div>' +
                            '<button class="remove-btn" onclick="removeFromCart(' + item.id + ')">Remove</button>' +
                        '</div>' +
                    '</div>'
                ).join('');
                
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                cartTotal.textContent = 'Total: $' + total.toFixed(2);
                checkoutBtn.disabled = false;
            }
        }
        
        async function checkout() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            try {
                console.log('Starting checkout with cart:', cart);
                const response = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart, total: total })
                });
                
                const result = await response.json();
                console.log('Checkout response:', result);
                
                if (result.success) {
                    console.log('Redirecting to:', result.redirectUrl);
                    window.location.href = result.redirectUrl;
                } else {
                    alert('Payment initiation failed. Please try again.');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Payment initiation failed. Please try again.');
            }
        }
        
        // Initialize the page
        loadProducts();
    </script>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Juice Shop server running on http://localhost:${PORT}`);
});