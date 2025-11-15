import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { 
  getSellersValidation, 
  placeOrderValidation, 
  getOrderDetailsValidation, 
  createComplaintValidation, 
  getComplaintsValidation 
} from '../validations/customer.validations';
import { validateRequest } from '../middleware/validate-request';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { UserRole } from '../models/user.model';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/complaints/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF and document files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Apply authentication middleware to all customer routes
router.use(authenticate);
router.use(authorize([UserRole.CUSTOMER]));

// Seller routes
router.get('/sellers', getSellersValidation, validateRequest, customerController.getSellers);

// Order routes
router.post('/orders', placeOrderValidation, validateRequest, customerController.placeOrder);
router.get('/orders/:id', getOrderDetailsValidation, validateRequest, customerController.getOrderDetails);

// Complaint routes
router.post(
  '/complaints',
  upload.array('attachments', 5), // Max 5 files
  createComplaintValidation,
  validateRequest,
  customerController.createComplaint
);

router.get(
  '/complaints',
  getComplaintsValidation,
  validateRequest,
  customerController.getComplaints
);

export default router;
