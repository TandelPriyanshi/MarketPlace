import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';
import { userController } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import Joi from 'joi';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Admin only routes
router.use(requireRole(UserRole.ADMIN));

const userIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
});

// User routes
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', validate(userIdSchema, 'params'), userController.getUserById.bind(userController));
router.put('/:id', validate(userIdSchema, 'params'), userController.updateUser.bind(userController));
router.put('/:id/deactivate', validate(userIdSchema, 'params'), userController.deactivateUser.bind(userController));
router.put('/:id/activate', validate(userIdSchema, 'params'), userController.activateUser.bind(userController));

export default router;

