import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { productIdSchema } from '../validators/product.validator';

const router = Router();

// Public routes - no authentication required
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', validate(productIdSchema, 'params'), productController.getProductById.bind(productController));

export default router;

