import { Notification, NotificationType } from '../models/notification.model';
import { Op } from 'sequelize';

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationRepository {
  /**
   * Get all notifications for a specific user
   */
  static async getNotificationsByUser(userId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }) {
    const whereClause: any = { userId };
    
    if (options?.unreadOnly) {
      whereClause.isRead = false;
    }

    return await Notification.findAll({
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
  static async getUnreadCount(userId: string): Promise<number> {
    return await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const [affectedCount] = await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );
    
    return affectedCount;
  }

  /**
   * Mark a specific notification as read
   */
  static async markOneAsRead(notificationId: string, userId: string): Promise<boolean> {
    const [affectedCount] = await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          id: notificationId,
          userId
        }
      }
    );
    
    return affectedCount > 0;
  }

  /**
   * Create a new notification
   */
  static async createNotification(payload: CreateNotificationPayload): Promise<Notification> {
    return await Notification.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data || {},
      isRead: false
    } as any);
  }

  /**
   * Create multiple notifications in bulk
   */
  static async createBulkNotifications(notifications: CreateNotificationPayload[]): Promise<Notification[]> {
    const notificationData = notifications.map(notification => ({
      ...notification,
      data: notification.data || {},
      isRead: false
    }));

    return await Notification.bulkCreate(notificationData as any);
  }

  /**
   * Delete notifications older than specified days
   */
  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const affectedCount = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        },
        isRead: true // Only delete read notifications
      }
    });

    return affectedCount;
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(notificationId: string): Promise<Notification | null> {
    return await Notification.findByPk(notificationId, {
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
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const affectedCount = await Notification.destroy({
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
  static async getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
    return await Notification.findAll({
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
