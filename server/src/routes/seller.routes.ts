import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Apply authentication and seller role check to all routes
router.use(authenticate, requireRole(UserRole.SELLER));

// Seller dashboard
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Seller dashboard' });
});

// Add more seller-specific routes here

export default router;
