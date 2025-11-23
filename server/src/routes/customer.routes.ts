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

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         rating:
 *           type: number
 * 
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 * 
 *     Complaint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderId:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer operations
 */

// Apply authentication middleware to all customer routes
router.use(authenticate);
router.use(authorize([UserRole.CUSTOMER]));

/**
 * @swagger
 * /api/v1/customer/sellers:
 *   get:
 *     summary: Get list of sellers
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
router.get('/sellers', getSellersValidation, validateRequest, customerController.getSellers);

/**
 * @swagger
 * /api/v1/customer/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
router.post('/orders', placeOrderValidation, validateRequest, customerController.placeOrder);

/**
 * @swagger
 * /api/v1/customer/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', getOrderDetailsValidation, validateRequest, customerController.getOrderDetails);

/**
 * @swagger
 * /api/v1/customer/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - description
 *             properties:
 *               orderId:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: Invalid input or file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
router.post(
  '/complaints',
  upload.array('attachments', 5),
  createComplaintValidation,
  validateRequest,
  customerController.createComplaint
);

/**
 * @swagger
 * /api/v1/customer/complaints:
 *   get:
 *     summary: Get customer's complaints
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter complaints by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
router.get(
  '/complaints',
  getComplaintsValidation,
  validateRequest,
  customerController.getComplaints
);

export default router;