// src/routes/delivery.routes.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import deliveryController from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { DeliveryStatus } from '../models/order.model';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Apply authentication and authorization middleware to all routes
router.use(authenticate, authorize(...[UserRole.DELIVERY_PERSON]));

/**
 * @swagger
 * /delivery/orders:
 *   get:
 *     summary: Get assigned orders for delivery person
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, picked_up, out_for_delivery, delivered, returned, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of assigned orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/orders', deliveryController.getAssignedOrders);

/**
 * @swagger
 * /delivery/assigned:
 *   get:
 *     summary: Get assigned deliveries for delivery person
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, picked_up, in_transit, delivered, failed]
 *         description: Filter deliveries by status
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: List of assigned deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     deliveries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Delivery'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/assigned', deliveryController.getAssignedDeliveries);

/**
 * @swagger
 * /delivery/stats:
 *   get:
 *     summary: Get delivery statistics for delivery person
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDeliveries:
 *                       type: integer
 *                     completedDeliveries:
 *                       type: integer
 *                     failedDeliveries:
 *                       type: integer
 *                     averageDeliveryTime:
 *                       type: number
 *                     totalDistance:
 *                       type: number
 */
router.get('/stats', deliveryController.getDeliveryStats);

/**
 * @swagger
 * /delivery/orders/{id}/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [picked_up, out_for_delivery, delivered, returned]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
router.put(
  '/orders/:id/status',
  [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('status').isIn(Object.values(DeliveryStatus)).withMessage('Invalid status'),
    body('notes').optional().isString(),
  ],
  deliveryController.updateDeliveryStatus
);

/**
 * @swagger
 * /delivery/orders/{id}/proof:
 *   post:
 *     summary: Upload delivery proof (signature or photo)
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (signature or delivery proof)
 *               type:
 *                 type: string
 *                 enum: [signature, delivery_proof, return_proof]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proof uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Attachment'
 */
router.post(
  '/orders/:id/proof',
  [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('type').isIn(['signature', 'delivery_proof', 'return_proof']).withMessage('Invalid proof type'),
    body('notes').optional().isString(),
  ],
  upload.single('file'),
  deliveryController.uploadDeliveryProof
);

/**
 * @swagger
 * /delivery/route/today:
 *   get:
 *     summary: Get today's delivery route
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's delivery route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/route/today', deliveryController.getTodaysRoute);

export default router;