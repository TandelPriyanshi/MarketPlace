"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
const notification_model_1 = require("../models/notification.model");
const logger_1 = require("../utils/logger");
class NotificationService {
    /**
     * Fetch notifications for the authenticated user
     */
    static async fetchNotifications(req, options) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    error: 'AUTH_REQUIRED'
                };
            }
            const notifications = await notificationRepository_1.NotificationRepository.getNotificationsByUser(userId, options);
            const unreadCount = await notificationRepository_1.NotificationRepository.getUnreadCount(userId);
            return {
                success: true,
                message: 'Notifications fetched successfully',
                data: {
                    notifications,
                    unreadCount,
                    total: notifications.length
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching notifications:', error);
            return {
                success: false,
                message: 'Failed to fetch notifications',
                error: error.message
            };
        }
    }
    /**
     * Create a notification (generic function used by other modules)
     */
    static async createNotification(payload) {
        try {
            const notification = await notificationRepository_1.NotificationRepository.createNotification(payload);
            logger_1.logger.info(`Notification created for user ${payload.userId}: ${payload.title}`);
            return {
                success: true,
                message: 'Notification created successfully',
                data: notification
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating notification:', error);
            return {
                success: false,
                message: 'Failed to create notification',
                error: error.message
            };
        }
    }
    /**
     * Create multiple notifications in bulk
     */
    static async createBulkNotifications(payloads) {
        try {
            const notifications = await notificationRepository_1.NotificationRepository.createBulkNotifications(payloads);
            logger_1.logger.info(`Bulk notifications created: ${notifications.length} notifications`);
            return {
                success: true,
                message: 'Bulk notifications created successfully',
                data: notifications
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating bulk notifications:', error);
            return {
                success: false,
                message: 'Failed to create bulk notifications',
                error: error.message
            };
        }
    }
    /**
     * Mark a single notification as read (only for authenticated user)
     */
    static async markAsRead(req, notificationId) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    error: 'AUTH_REQUIRED'
                };
            }
            const success = await notificationRepository_1.NotificationRepository.markOneAsRead(notificationId, userId);
            if (!success) {
                return {
                    success: false,
                    message: 'Notification not found or not owned by user',
                    error: 'NOTIFICATION_NOT_FOUND'
                };
            }
            logger_1.logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
            return {
                success: true,
                message: 'Notification marked as read successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Error marking notification as read:', error);
            return {
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message
            };
        }
    }
    /**
     * Mark all notifications as read for the authenticated user
     */
    static async markAllAsRead(req) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    error: 'AUTH_REQUIRED'
                };
            }
            const affectedCount = await notificationRepository_1.NotificationRepository.markAllAsRead(userId);
            logger_1.logger.info(`${affectedCount} notifications marked as read for user ${userId}`);
            return {
                success: true,
                message: 'All notifications marked as read successfully',
                data: {
                    markedCount: affectedCount
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error marking all notifications as read:', error);
            return {
                success: false,
                message: 'Failed to mark all notifications as read',
                error: error.message
            };
        }
    }
    /**
     * Get unread notification count for authenticated user
     */
    static async getUnreadCount(req) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    error: 'AUTH_REQUIRED'
                };
            }
            const count = await notificationRepository_1.NotificationRepository.getUnreadCount(userId);
            return {
                success: true,
                message: 'Unread count fetched successfully',
                data: { unreadCount: count }
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching unread count:', error);
            return {
                success: false,
                message: 'Failed to fetch unread count',
                error: error.message
            };
        }
    }
    /**
     * Delete a notification (only for authenticated user)
     */
    static async deleteNotification(req, notificationId) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return {
                    success: false,
                    message: 'User not authenticated',
                    error: 'AUTH_REQUIRED'
                };
            }
            const success = await notificationRepository_1.NotificationRepository.deleteNotification(notificationId, userId);
            if (!success) {
                return {
                    success: false,
                    message: 'Notification not found or not owned by user',
                    error: 'NOTIFICATION_NOT_FOUND'
                };
            }
            logger_1.logger.info(`Notification ${notificationId} deleted by user ${userId}`);
            return {
                success: true,
                message: 'Notification deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Error deleting notification:', error);
            return {
                success: false,
                message: 'Failed to delete notification',
                error: error.message
            };
        }
    }
    /**
     * Helper function to create order-related notifications
     */
    static async createOrderNotification(userId, type, orderData) {
        const messages = {
            [notification_model_1.NotificationType.ORDER_PLACED]: `Your order #${orderData.orderNumber} has been placed successfully`,
            [notification_model_1.NotificationType.ORDER_CONFIRMED]: `Your order #${orderData.orderNumber} has been confirmed`,
            [notification_model_1.NotificationType.ORDER_SHIPPED]: `Your order #${orderData.orderNumber} has been shipped`,
            [notification_model_1.NotificationType.ORDER_DELIVERED]: `Your order #${orderData.orderNumber} has been delivered`,
            [notification_model_1.NotificationType.ORDER_CANCELLED]: `Your order #${orderData.orderNumber} has been cancelled`
        };
        const titles = {
            [notification_model_1.NotificationType.ORDER_PLACED]: 'Order Placed',
            [notification_model_1.NotificationType.ORDER_CONFIRMED]: 'Order Confirmed',
            [notification_model_1.NotificationType.ORDER_SHIPPED]: 'Order Shipped',
            [notification_model_1.NotificationType.ORDER_DELIVERED]: 'Order Delivered',
            [notification_model_1.NotificationType.ORDER_CANCELLED]: 'Order Cancelled'
        };
        return await this.createNotification({
            userId,
            type,
            title: titles[type],
            message: messages[type],
            data: {
                orderId: orderData.orderId,
                orderNumber: orderData.orderNumber
            }
        });
    }
    /**
     * Helper function to create delivery-related notifications
     */
    static async createDeliveryNotification(userId, type, deliveryData) {
        if (type === notification_model_1.NotificationType.DELIVERY_ASSIGNED) {
            return await this.createNotification({
                userId,
                type,
                title: 'Delivery Assigned',
                message: `Delivery person has been assigned for your order #${deliveryData.orderNumber}`,
                data: {
                    orderId: deliveryData.orderId,
                    orderNumber: deliveryData.orderNumber
                }
            });
        }
        else {
            return await this.createNotification({
                userId,
                type,
                title: 'Delivery Completed',
                message: `Your order #${deliveryData.orderNumber} has been delivered successfully`,
                data: {
                    orderId: deliveryData.orderId,
                    orderNumber: deliveryData.orderNumber
                }
            });
        }
    }
    /**
     * Helper function to create complaint notifications
     */
    static async createComplaintNotification(userId, type, complaintData) {
        if (type === notification_model_1.NotificationType.COMPLAINT_CREATED) {
            return await this.createNotification({
                userId,
                type,
                title: 'Complaint Created',
                message: `Your complaint "${complaintData.complaintTitle}" has been received and is being processed`,
                data: {
                    complaintId: complaintData.complaintId,
                    complaintTitle: complaintData.complaintTitle
                }
            });
        }
        else {
            return await this.createNotification({
                userId,
                type,
                title: 'Complaint Resolved',
                message: `Your complaint "${complaintData.complaintTitle}" has been resolved`,
                data: {
                    complaintId: complaintData.complaintId,
                    complaintTitle: complaintData.complaintTitle
                }
            });
        }
    }
}
exports.NotificationService = NotificationService;
