/**
 * Juice Shop Module - External E-commerce Platform Integration
 * 
 * This module simulates integration with the OWASP Juice Shop platform
 * for external payment processing demonstration.
 */

import { Router } from 'express';
import { JuiceShopController } from './JuiceShopController';

const router = Router();

// Juice Shop integration routes
router.get('/products', JuiceShopController.getProducts);
router.post('/order', JuiceShopController.createOrder);
router.get('/order/:orderId', JuiceShopController.getOrder);
router.post('/order/:orderId/payment', JuiceShopController.processPayment);

// Basket management routes
router.get('/BasketItems', JuiceShopController.getBasketItems);
router.post('/BasketItems', JuiceShopController.addToBasket);
router.delete('/BasketItems/:itemId', JuiceShopController.removeFromBasket);

// Checkout route
router.post('/checkout', JuiceShopController.checkout);

export { router as juiceShopRoutes };
export { JuiceShopController } from './JuiceShopController';