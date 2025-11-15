import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';
import { sellerController } from '../controllers/seller.controller';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productIdSchema } from '../validators/product.validator';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Apply authentication and seller role check to all routes
router.use(authenticate, requireRole(UserRole.SELLER));

// Seller dashboard
router.get('/dashboard', sellerController.getDashboard.bind(sellerController));

// Product routes
router.get('/products', sellerController.getProducts.bind(sellerController));
router.post('/products', validate(createProductSchema), sellerController.createProduct.bind(sellerController));
router.put('/products/:id', validate(updateProductSchema), validate(productIdSchema, 'params'), sellerController.updateProduct.bind(sellerController));
router.delete('/products/:id', validate(productIdSchema, 'params'), sellerController.deleteProduct.bind(sellerController));

// Order routes
router.get('/orders', sellerController.getOrders.bind(sellerController));
router.put('/orders/:id/status', validate(updateOrderStatusSchema), validate(productIdSchema, 'params'), sellerController.updateOrderStatus.bind(sellerController));

export default router;
