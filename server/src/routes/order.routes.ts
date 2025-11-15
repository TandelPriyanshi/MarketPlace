import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import { orderIdSchema } from '../validators/order.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Order routes
router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/:id', validate(orderIdSchema, 'params'), orderController.getOrderById.bind(orderController));
router.put('/:id/cancel', validate(orderIdSchema, 'params'), orderController.cancelOrder.bind(orderController));

export default router;

