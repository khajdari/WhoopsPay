import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'cancelled' | null>(null);

  useEffect(() => {
    fetchProducts();
    checkPaymentStatus();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const productsData = await response.json();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      setStatusMessage('Payment completed successfully! Your order has been processed.');
      setStatusType('success');
      setCart([]);
    } else if (status === 'cancelled') {
      setStatusMessage('Payment was cancelled. Your items are still in your cart.');
      setStatusType('cancelled');
    } else if (status === 'error') {
      setStatusMessage('Payment failed. Please try again or contact support.');
      setStatusType('error');
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
          setCart(cart.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ));
        } else {
          setCart([...cart, { ...product, quantity: 1 }]);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handlePayWithWhoopsPay = async () => {
    const totalAmount = getTotalPrice();
    
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          items: cart,
          currency: 'USD'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Redirect to WhoopsPay for payment processing
        window.location.href = result.session.redirectUrl;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🧃 OWASP Juice Shop</h1>
        <p>Probably the most modern and sophisticated insecure web application</p>
      </div>

      {statusMessage && (
        <div className={`status-message status-${statusType}`}>
          {statusMessage}
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">{product.image}</div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="product-price">${product.price.toFixed(2)}</div>
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
            <button 
              className="add-to-cart-btn"
              disabled={!product.inStock}
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-section">
          <h2 className="cart-header">Shopping Cart</h2>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <strong>{item.name}</strong> x {item.quantity}
              </div>
              <div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ marginLeft: '10px', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            Total: ${getTotalPrice()}
          </div>
          <button className="checkout-btn">
            Standard Checkout
          </button>
          <button 
            className="pay-with-whoopspay"
            onClick={handlePayWithWhoopsPay}
          >
            💳 Pay with WhoopsPay
          </button>
        </div>
      )}

      {cart.length === 0 && !statusMessage && (
        <div className="cart-section">
          <h2 className="cart-header">Shopping Cart</h2>
          <p>Your cart is empty. Add some products to get started!</p>
        </div>
      )}
    </div>
  );
}

export default App;