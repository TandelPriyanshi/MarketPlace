import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as Joi from 'joi';

const router = Router();
const orderController = new OrderController();

// Validation schemas
const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'RETURN_COMPLETED', 'COMPLETED').required()
});

// Apply authentication to all routes
router.use(authenticate);

// Order routes
router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/customer', orderController.getCustomerOrders.bind(orderController));
router.get('/customer/orders', orderController.getCustomerOrders.bind(orderController));
router.get('/seller/orders', orderController.getSellerOrders.bind(orderController));
router.get('/:id', validate(orderIdSchema, 'params'), orderController.getOrderById.bind(orderController));
router.post('/', orderController.placeOrder.bind(orderController));
router.put('/:id/status', validate(orderIdSchema, 'params'), orderController.updateOrderStatus.bind(orderController));
router.put('/:id/cancel', validate(orderIdSchema, 'params'), orderController.cancelOrder.bind(orderController));

export default router;
