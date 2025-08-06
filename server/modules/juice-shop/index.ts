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

export { router as juiceShopRoutes };
export { JuiceShopController } from './JuiceShopController';