import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';
import { salesmanController } from '../controllers/salesman.controller';
import { validate } from '../middleware/validate.middleware';
import { createBeatSchema, createVisitSchema, updateVisitStatusSchema, visitIdSchema, beatIdSchema } from '../validators/salesman.validator';

const router = Router();

// Apply authentication - salesman role check can be added when UserRole.SALESMAN is added to model enum
// For now, using SALESMAN as placeholder or remove role check
router.use(authenticate);

// Beat routes
router.post('/beats', validate(createBeatSchema), salesmanController.createBeat.bind(salesmanController));
router.get('/beats', salesmanController.getBeats.bind(salesmanController));
router.get('/beats/:id', validate(beatIdSchema, 'params'), salesmanController.getBeatById.bind(salesmanController));

// Visit routes
router.post('/visits', validate(createVisitSchema), salesmanController.createVisit.bind(salesmanController));
router.get('/visits', salesmanController.getVisits.bind(salesmanController));
router.get('/visits/:id', validate(visitIdSchema, 'params'), salesmanController.getVisitById.bind(salesmanController));
router.put('/visits/:id/status', validate(updateVisitStatusSchema), validate(visitIdSchema, 'params'), salesmanController.updateVisitStatus.bind(salesmanController));

export default router;

