"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notification_model_1 = require("../models/notification.model");
const sequelize_1 = require("sequelize");
class NotificationRepository {
    /**
     * Get all notifications for a specific user
     */
    static async getNotificationsByUser(userId, options) {
        const whereClause = { userId };
        if (options?.unreadOnly) {
            whereClause.isRead = false;
        }
        return await notification_model_1.Notification.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: options?.limit,
            offset: options?.offset,
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
    }
    /**
     * Get unread notification count for a user
     */
    static async getUnreadCount(userId) {
        return await notification_model_1.Notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }
    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        const [affectedCount] = await notification_model_1.Notification.update({
            isRead: true,
            readAt: new Date()
        }, {
            where: {
                userId,
                isRead: false
            }
        });
        return affectedCount;
    }
    /**
     * Mark a specific notification as read
     */
    static async markOneAsRead(notificationId, userId) {
        const [affectedCount] = await notification_model_1.Notification.update({
            isRead: true,
            readAt: new Date()
        }, {
            where: {
                id: notificationId,
                userId
            }
        });
        return affectedCount > 0;
    }
    /**
     * Create a new notification
     */
    static async createNotification(payload) {
        return await notification_model_1.Notification.create({
            userId: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            data: payload.data || {},
            isRead: false
        });
    }
    /**
     * Create multiple notifications in bulk
     */
    static async createBulkNotifications(notifications) {
        const notificationData = notifications.map(notification => ({
            ...notification,
            data: notification.data || {},
            isRead: false
        }));
        return await notification_model_1.Notification.bulkCreate(notificationData);
    }
    /**
     * Delete notifications older than specified days
     */
    static async deleteOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const affectedCount = await notification_model_1.Notification.destroy({
            where: {
                createdAt: {
                    [sequelize_1.Op.lt]: cutoffDate
                },
                isRead: true // Only delete read notifications
            }
        });
        return affectedCount;
    }
    /**
     * Get notification by ID
     */
    static async getNotificationById(notificationId) {
        return await notification_model_1.Notification.findByPk(notificationId, {
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
    }
    /**
     * Delete a specific notification
     */
    static async deleteNotification(notificationId, userId) {
        const affectedCount = await notification_model_1.Notification.destroy({
            where: {
                id: notificationId,
                userId
            }
        });
        return affectedCount > 0;
    }
    /**
     * Get notifications by type for a user
     */
    static async getNotificationsByType(userId, type) {
        return await notification_model_1.Notification.findAll({
            where: {
                userId,
                type
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
    }
}
exports.NotificationRepository = NotificationRepository;
