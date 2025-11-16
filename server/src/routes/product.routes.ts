import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { productIdSchema, createProductSchema, updateProductSchema } from '../validators/product.validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Public routes - no authentication required
router.get('/', productController.getAllProducts.bind(productController));
router.get('/all', productController.getAllProducts.bind(productController));
router.get('/:id', validate(productIdSchema, 'params'), productController.getProductById.bind(productController));

// Protected routes - authentication and seller role required
router.post('/', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(createProductSchema, 'body'), 
  productController.createProduct.bind(productController)
);

router.put('/:id', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(productIdSchema, 'params'),
  validate(updateProductSchema, 'body'), 
  productController.updateProduct.bind(productController)
);

router.delete('/:id', 
  authenticate, 
  authorize([UserRole.SELLER]), 
  validate(productIdSchema, 'params'),
  productController.deleteProduct.bind(productController)
);

export default router;

