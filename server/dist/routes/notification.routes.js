"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_request_1 = require("../middleware/validate-request");
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Notification unique identifier
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID who owns this notification
 *         type:
 *           type: string
 *           enum: [order_placed, order_confirmed, order_shipped, order_delivered, order_cancelled, payment_received, payment_failed, complaint_created, complaint_resolved, product_low_stock, delivery_assigned, delivery_completed, system_update]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message content
 *         data:
 *           type: object
 *           description: Additional data payload
 *         isRead:
 *           type: boolean
 *           description: Whether notification has been read
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When notification was marked as read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When notification was last updated
 */
// Validation schemas
const createNotificationValidation = [
    (0, express_validator_1.body)('userId')
        .isUUID()
        .withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('type')
        .isIn(['order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
        'payment_received', 'payment_failed', 'complaint_created', 'complaint_resolved',
        'product_low_stock', 'delivery_assigned', 'delivery_completed', 'system_update'])
        .withMessage('Valid notification type is required'),
    (0, express_validator_1.body)('title')
        .isString()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters'),
    (0, express_validator_1.body)('message')
        .isString()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    (0, express_validator_1.body)('data')
        .optional()
        .isObject()
        .withMessage('Data must be an object')
];
const bulkNotificationValidation = [
    (0, express_validator_1.body)('notifications')
        .isArray({ min: 1 })
        .withMessage('Notifications array is required with at least one item'),
    (0, express_validator_1.body)('notifications.*.userId')
        .isUUID()
        .withMessage('Valid user ID is required for each notification'),
    (0, express_validator_1.body)('notifications.*.type')
        .isIn(['order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
        'payment_received', 'payment_failed', 'complaint_created', 'complaint_resolved',
        'product_low_stock', 'delivery_assigned', 'delivery_completed', 'system_update'])
        .withMessage('Valid notification type is required for each notification'),
    (0, express_validator_1.body)('notifications.*.title')
        .isString()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters for each notification'),
    (0, express_validator_1.body)('notifications.*.message')
        .isString()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters for each notification'),
    (0, express_validator_1.body)('notifications.*.data')
        .optional()
        .isObject()
        .withMessage('Data must be an object for each notification')
];
const notificationIdValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Valid notification ID is required')
];
const paginationValidation = [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer'),
    (0, express_validator_1.query)('unreadOnly')
        .optional()
        .isBoolean()
        .withMessage('unreadOnly must be a boolean')
];
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get logged-in user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of notifications to skip
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Return only unread notifications
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     unreadCount:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_middleware_1.authenticate, paginationValidation, validate_request_1.validateRequest, notification_controller_1.NotificationController.getNotifications);
/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/unread-count', auth_middleware_1.authenticate, notification_controller_1.NotificationController.getUnreadCount);
/**
 * @swagger
 * /api/v1/notifications/readAll:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     markedCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/readAll', auth_middleware_1.authenticate, notification_controller_1.NotificationController.markAllAsRead);
/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/read', auth_middleware_1.authenticate, notificationIdValidation, validate_request_1.validateRequest, notification_controller_1.NotificationController.markAsRead);
/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Create notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID to receive notification
 *               type:
 *                 type: string
 *                 enum: [order_placed, order_confirmed, order_shipped, order_delivered, order_cancelled, payment_received, payment_failed, complaint_created, complaint_resolved, product_low_stock, delivery_assigned, delivery_completed, system_update]
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               data:
 *                 type: object
 *                 description: Additional notification data
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)([user_model_1.UserRole.ADMIN]), createNotificationValidation, validate_request_1.validateRequest, notification_controller_1.NotificationController.createNotification);
/**
 * @swagger
 * /api/v1/notifications/bulk:
 *   post:
 *     summary: Create multiple notifications (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - userId
 *                     - type
 *                     - title
 *                     - message
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                       enum: [order_placed, order_confirmed, order_shipped, order_delivered, order_cancelled, payment_received, payment_failed, complaint_created, complaint_resolved, product_low_stock, delivery_assigned, delivery_completed, system_update]
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     data:
 *                       type: object
 *     responses:
 *       201:
 *         description: Bulk notifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/bulk', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)([user_model_1.UserRole.ADMIN]), bulkNotificationValidation, validate_request_1.validateRequest, notification_controller_1.NotificationController.createBulkNotifications);
/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_middleware_1.authenticate, notificationIdValidation, validate_request_1.validateRequest, notification_controller_1.NotificationController.deleteNotification);
exports.default = router;
