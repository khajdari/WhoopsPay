/**
 * Juice Shop Page - OWASP Juice Shop integration interface
 * 
 * Simulates external e-commerce application demonstrating cross-platform payment integration:
 * - Shopping cart functionality with quantity management
 * - Product display with pricing and descriptions
 * - WhoopsPay payment integration for checkout
 * - Session-based payment data transfer
 * - Order total calculation and management
 * 
 * Educational Security Features:
 * - Demonstrates external application payment flows
 * - Shows cross-site payment integration vulnerabilities
 * - Includes session storage security patterns
 * 
 * VULNERABILITY NOTE: May contain intentional security weaknesses
 * for educational cross-platform integration training.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Minus, Plus } from "lucide-react";

/**
 * CartItem Interface - Shopping cart item structure
 * 
 * Defines the shape of items in the shopping cart including
 * product details, pricing, and quantity information.
 */
interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
}

/**
 * JuiceShop Component - E-commerce simulation interface
 * 
 * Simulates an external e-commerce application with WhoopsPay integration.
 * Features include:
 * - Shopping cart management with quantity controls
 * - Product catalog display with pricing
 * - Total calculation and order management
 * - WhoopsPay checkout integration
 * - Cross-platform payment processing
 */
export default function JuiceShop() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Apple Pomace",
      price: 0.89,
      description: "Fiber-rich apple pomace is what remains after processing apple juice",
      image: "🍎",
      quantity: 1
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleWhoopsPayCheckout = () => {
    // Create external payment request
    const paymentData = {
      amount: totalAmount.toFixed(2),
      currency: "USD",
      description: "Juice Shop Purchase",
      items: cartItems,
      returnUrl: `${window.location.origin}/juice-shop?status=success`,
      cancelUrl: `${window.location.origin}/juice-shop?status=cancelled`
    };

    // Store payment data in sessionStorage for retrieval
    sessionStorage.setItem('juiceShopPayment', JSON.stringify(paymentData));
    
    // Redirect to WhoopsPay external payment flow
    window.location.href = `/external-payment-redirect?amount=${totalAmount.toFixed(2)}&description=Juice Shop Purchase&source=juice-shop`;
  };

  // Check for payment status in URL
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('status');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">OWASP Juice Shop</h1>
            </div>
            <div className="text-sm text-gray-500">
              Probably the most modern and sophisticated insecure web application
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Payment successful! Your order has been processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Payment cancelled. Your order was not processed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Catalog */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Fresh Juices & More</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">🍎</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Apple Pomace</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Fiber-rich apple pomace is what remains after processing apple juice
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">$0.89</span>
                    <Button 
                      onClick={() => updateQuantity(1, cartItems[0]?.quantity + 1 || 1)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden opacity-50">
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">🥕</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrot Juice</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Fresh carrot juice packed with vitamins
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-400">$2.99</span>
                    <Button disabled className="bg-gray-300">
                      Out of Stock
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Shopping Cart</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.image}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* WhoopsPay Checkout Button */}
                      <Button
                        onClick={handleWhoopsPayCheckout}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                        size="lg"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span className="font-bold">Pay with WhoopsPay</span>
                        </div>
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-2">
                        Secure payment processing powered by WhoopsPay
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>OWASP Juice Shop - Educational Security Testing Platform</p>
          <p className="mt-1">Integrated with WhoopsPay for payment processing demonstrations</p>
        </footer>
      </main>
    </div>
  );
}