import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { SalesmanController } from '../controllers/salesman.controller';
import { UserRole } from '../models/user.model';
import { authorize } from '../middleware/role.middleware';

const router = Router();
const salesmanController = new SalesmanController();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Beat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the beat
 *         name:
 *           type: string
 *           description: Name of the beat
 *         area:
 *           type: string
 *           description: Area covered by the beat
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, COMPLETED]
 *           description: Current status of the beat
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           description: ID of the salesman assigned to this beat
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         salesmanId:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date
 *         checkIn:
 *           type: string
 *           format: date-time
 *         checkOut:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, HALF_DAY, LEAVE]
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *
 *     Visit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customerId:
 *           type: string
 *           format: uuid
 *         salesmanId:
 *           type: string
 *           format: uuid
 *         purpose:
 *           type: string
 *         status:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         notes:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *
 *     SalesOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customerId:
 *           type: string
 *           format: uuid
 *         salesmanId:
 *           type: string
 *           format: uuid
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *
 *     Performance:
 *       type: object
 *       properties:
 *         salesmanId:
 *           type: string
 *           format: uuid
 *         totalVisits:
 *           type: integer
 *         completedVisits:
 *           type: integer
 *         totalSales:
 *           type: number
 *         totalOrders:
 *           type: integer
 *         averageOrderValue:
 *           type: number
 *         attendancePercentage:
 *           type: number
 *
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         error:
 *           type: string

/**
 * @swagger
 * tags:
 *   name: Salesman
 *   description: Salesman operations
 */

// Apply authentication and authorization
router.use(authenticate);
// Uncomment when SALESMAN role is added to UserRole enum
// router.use(authorize([UserRole.SALESMAN]));

/**
 * @swagger
 * /api/salesman/beats:
 *   post:
 *     summary: Create a new beat
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - area
 *             properties:
 *               name:
 *                 type: string
 *               area:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, COMPLETED]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Beat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beat'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/beats', 
  (req, res, next) => { validateRequest(req, res, next); },
  salesmanController.createBeat.bind(salesmanController)
);

/**
 * @swagger
 * /api/salesman/beats:
 *   get:
 *     summary: Get all beats for the logged-in salesman
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of beats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Beat'
 */
router.get('/beats', salesmanController.getBeats.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/attendance:
 *   post:
 *     summary: Mark attendance (check-in/check-out)
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - location
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CHECK_IN, CHECK_OUT]
 *               location:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid input or already checked in/out
 */
router.post('/attendance', salesmanController.markAttendance.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/visits:
 *   post:
 *     summary: Log a new customer visit
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - purpose
 *               - location
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               purpose:
 *                 type: string
 *               notes:
 *                 type: string
 *               location:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       201:
 *         description: Visit logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 */
router.post('/visits', salesmanController.logVisit.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/visits:
 *   get:
 *     summary: Get all visits for the logged-in salesman
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter visits by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter visits by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of visits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 */
router.get('/visits', salesmanController.getVisits.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/visits/{id}:
 *   get:
 *     summary: Get visit details by ID
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Visit ID
 *     responses:
 *       200:
 *         description: Visit details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 */
router.get('/visits/:id', salesmanController.getVisitById.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/visits/{id}/status:
 *   put:
 *     summary: Update visit status
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Visit ID
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
 *                 enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visit status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Visit not found
 */
router.put('/visits/:id/status', salesmanController.updateVisitStatus.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/orders:
 *   post:
 *     summary: Create a new sales order
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesOrder'
 */
router.post('/orders', salesmanController.createSalesOrder.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/orders:
 *   get:
 *     summary: Get all orders for the logged-in salesman
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter orders by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of sales orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SalesOrder'
 */
router.get('/orders', salesmanController.getOrders.bind(salesmanController));

/**
 * @swagger
 * /api/salesman/performance:
 *   get:
 *     summary: Get performance metrics for the logged-in salesman
 *     tags: [Salesman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for performance metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for performance metrics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Salesman performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Performance'
 */
router.get('/performance', salesmanController.getSalesmanPerformance.bind(salesmanController));

export default router;

