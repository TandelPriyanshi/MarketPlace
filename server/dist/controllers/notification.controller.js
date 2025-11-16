"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const notification_model_1 = require("../models/notification.model");
const logger_1 = require("../utils/logger");
class NotificationController {
    /**
     * GET /notifications
     * Get logged-in user notifications
     */
    static async getNotifications(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
            const unreadOnly = req.query.unreadOnly === 'true';
            const result = await notification_service_1.NotificationService.fetchNotifications(req, {
                limit,
                offset,
                unreadOnly
            });
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - getNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * GET /notifications/unread-count
     * Get unread notification count for logged-in user
     */
    static async getUnreadCount(req, res) {
        try {
            const result = await notification_service_1.NotificationService.getUnreadCount(req);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - getUnreadCount:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * PUT /notifications/readAll
     * Mark all notifications as read for logged-in user
     */
    static async markAllAsRead(req, res) {
        try {
            const result = await notification_service_1.NotificationService.markAllAsRead(req);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - markAllAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * PUT /notifications/:id/read
     * Mark single notification as read
     */
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Notification ID is required',
                    error: 'MISSING_NOTIFICATION_ID'
                });
                return;
            }
            const result = await notification_service_1.NotificationService.markAsRead(req, id);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            else if (result.error === 'NOTIFICATION_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - markAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * POST /notifications
     * (Admin/internal) create notification
     */
    static async createNotification(req, res) {
        try {
            const { userId, type, title, message, data } = req.body;
            // Validate required fields
            if (!userId || !type || !title || !message) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: userId, type, title, message',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
                return;
            }
            // Validate notification type
            if (!Object.values(notification_model_1.NotificationType).includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid notification type',
                    error: 'INVALID_NOTIFICATION_TYPE'
                });
                return;
            }
            const result = await notification_service_1.NotificationService.createNotification({
                userId,
                type,
                title,
                message,
                data: data || {}
            });
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - createNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * POST /notifications/bulk
     * (Admin/internal) create multiple notifications
     */
    static async createBulkNotifications(req, res) {
        try {
            const { notifications } = req.body;
            if (!notifications || !Array.isArray(notifications)) {
                res.status(400).json({
                    success: false,
                    message: 'notifications array is required',
                    error: 'MISSING_NOTIFICATIONS_ARRAY'
                });
                return;
            }
            // Validate each notification
            for (const notification of notifications) {
                if (!notification.userId || !notification.type || !notification.title || !notification.message) {
                    res.status(400).json({
                        success: false,
                        message: 'Each notification must have: userId, type, title, message',
                        error: 'INVALID_NOTIFICATION_FORMAT'
                    });
                    return;
                }
                if (!Object.values(notification_model_1.NotificationType).includes(notification.type)) {
                    res.status(400).json({
                        success: false,
                        message: `Invalid notification type: ${notification.type}`,
                        error: 'INVALID_NOTIFICATION_TYPE'
                    });
                    return;
                }
            }
            const result = await notification_service_1.NotificationService.createBulkNotifications(notifications);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - createBulkNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * DELETE /notifications/:id
     * Delete a notification (user can only delete their own)
     */
    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Notification ID is required',
                    error: 'MISSING_NOTIFICATION_ID'
                });
                return;
            }
            const result = await notification_service_1.NotificationService.deleteNotification(req, id);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            else if (result.error === 'NOTIFICATION_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Controller error - deleteNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    /**
     * Internal helper method for creating order notifications
     * This can be called from other services/controllers
     */
    static async createOrderNotification(userId, type, orderData) {
        return await notification_service_1.NotificationService.createOrderNotification(userId, type, orderData);
    }
    /**
     * Internal helper method for creating delivery notifications
     */
    static async createDeliveryNotification(userId, type, deliveryData) {
        return await notification_service_1.NotificationService.createDeliveryNotification(userId, type, deliveryData);
    }
    /**
     * Internal helper method for creating complaint notifications
     */
    static async createComplaintNotification(userId, type, complaintData) {
        return await notification_service_1.NotificationService.createComplaintNotification(userId, type, complaintData);
    }
}
exports.NotificationController = NotificationController;
