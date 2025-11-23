import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { complaintController } from '../controllers/complaint.controller';
import { validate } from '../middleware/validate.middleware';
import { createComplaintSchema, complaintIdSchema } from '../validators/customer.validator';
import { upload } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - orderId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the complaint
 *         title:
 *           type: string
 *           description: The title of the complaint
 *         description:
 *           type: string
 *           description: Detailed description of the complaint
 *         status:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *           default: pending
 *         orderId:
 *           type: string
 *           description: ID of the order this complaint is related to
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Array of file attachments
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management endpoints
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - orderId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               orderId:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/', 
  upload.array('attachments', 5), 
  validate(createComplaintSchema), 
  complaintController.createComplaint.bind(complaintController)
);

/**
 * @swagger
 * /api/v1/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, rejected]
 *         description: Filter complaints by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of complaints to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
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
 */
router.get('/', complaintController.getComplaints.bind(complaintController));

/**
 * @swagger
 * /api/v1/complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id', 
  validate(complaintIdSchema, 'params'), 
  complaintController.getComplaintById.bind(complaintController)
);

/**
 * @swagger
 * /api/v1/complaints/{id}/status:
 *   put:
 *     summary: Update complaint status
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID
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
 *                 enum: [in_progress, resolved, rejected]
 *     responses:
 *       200:
 *         description: Complaint status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only admins can update complaint status
 *       404:
 *         description: Complaint not found
 */
router.put(
  '/:id/status', 
  validate(complaintIdSchema, 'params'), 
  complaintController.updateComplaintStatus.bind(complaintController)
);

export default router;