import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { SalesmanController } from '../controllers/salesman.controller';

const router = Router();
const salesmanController = new SalesmanController();

// Apply authentication - salesman role check can be added when UserRole.SALESMAN is added to model enum
// For now, using SALESMAN as placeholder or remove role check
router.use(authenticate);

// Beat routes
router.post('/beats', (req, res, next) => {
  validateRequest(req, res, next);
}, salesmanController.createBeat.bind(salesmanController));
router.get('/beats', salesmanController.getBeats.bind(salesmanController));

// Attendance routes
router.post('/attendance', salesmanController.markAttendance.bind(salesmanController));

// Visit routes
router.post('/visits', salesmanController.logVisit.bind(salesmanController));
router.get('/visits', salesmanController.getVisits.bind(salesmanController));
router.get('/visits/:id', salesmanController.getVisitById.bind(salesmanController));
router.put('/visits/:id/status', salesmanController.updateVisitStatus.bind(salesmanController));

// Sales Order routes
router.post('/orders', salesmanController.createSalesOrder.bind(salesmanController));
router.get('/orders', salesmanController.getOrders.bind(salesmanController));

// Performance routes
router.get('/performance', salesmanController.getSalesmanPerformance.bind(salesmanController));

export default router;

