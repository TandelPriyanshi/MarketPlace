import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import sellerRoutes from './seller.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import deliveryRoutes from './delivery.routes';
import salesmanRoutes from './salesman.routes';
import customerRoutes from './customer.routes';
import complaintRoutes from './complaint.routes';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Register all routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/sellers`, sellerRoutes);
router.use(`${API_PREFIX}/products`, productRoutes);
router.use(`${API_PREFIX}/orders`, orderRoutes);
router.use(`${API_PREFIX}/delivery`, deliveryRoutes);
router.use(`${API_PREFIX}/salesmen`, salesmanRoutes);
router.use(`${API_PREFIX}/customers`, customerRoutes);
router.use(`${API_PREFIX}/complaints`, complaintRoutes);

// Root API route - returns available endpoints
router.get('/api', (req, res) => {
  res.json({
    message: 'Marketplace API',
    version: 'v1',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      sellers: `${API_PREFIX}/sellers`,
      products: `${API_PREFIX}/products`,
      orders: `${API_PREFIX}/orders`,
      delivery: `${API_PREFIX}/delivery`,
      salesmen: `${API_PREFIX}/salesmen`,
      customers: `${API_PREFIX}/customers`,
      complaints: `${API_PREFIX}/complaints`,
      docs: '/api-docs'
    }
  });
});

export default router;

