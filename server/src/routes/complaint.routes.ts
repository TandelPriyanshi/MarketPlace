import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { complaintController } from '../controllers/complaint.controller';
import { validate } from '../middleware/validate.middleware';
import { createComplaintSchema, complaintIdSchema } from '../validators/customer.validator';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Complaint routes
router.post('/', upload.array('attachments', 5), validate(createComplaintSchema), complaintController.createComplaint.bind(complaintController));
router.get('/', complaintController.getComplaints.bind(complaintController));
router.get('/:id', validate(complaintIdSchema, 'params'), complaintController.getComplaintById.bind(complaintController));
router.put('/:id/status', validate(complaintIdSchema, 'params'), complaintController.updateComplaintStatus.bind(complaintController));

export default router;

