import { Request } from 'express';
import { NotificationRepository, CreateNotificationPayload } from '../repositories/notificationRepository';
import { NotificationType } from '../models/notification.model';
import { logger } from '../utils/logger';

export interface NotificationServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class NotificationService {
  /**
   * Fetch notifications for the authenticated user
   */
  static async fetchNotifications(req: Request, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationServiceResponse> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
          error: 'AUTH_REQUIRED'
        };
      }

      const notifications = await NotificationRepository.getNotificationsByUser(userId, options);
      const unreadCount = await NotificationRepository.getUnreadCount(userId);

      return {
        success: true,
        message: 'Notifications fetched successfully',
        data: {
          notifications,
          unreadCount,
          total: notifications.length
        }
      };
    } catch (error: any) {
      logger.error('Error fetching notifications:', error);
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
  static async createNotification(payload: CreateNotificationPayload): Promise<NotificationServiceResponse> {
    try {
      const notification = await NotificationRepository.createNotification(payload);

      logger.info(`Notification created for user ${payload.userId}: ${payload.title}`);

      return {
        success: true,
        message: 'Notification created successfully',
        data: notification
      };
    } catch (error: any) {
      logger.error('Error creating notification:', error);
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
  static async createBulkNotifications(payloads: CreateNotificationPayload[]): Promise<NotificationServiceResponse> {
    try {
      const notifications = await NotificationRepository.createBulkNotifications(payloads);

      logger.info(`Bulk notifications created: ${notifications.length} notifications`);

      return {
        success: true,
        message: 'Bulk notifications created successfully',
        data: notifications
      };
    } catch (error: any) {
      logger.error('Error creating bulk notifications:', error);
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
  static async markAsRead(req: Request, notificationId: string): Promise<NotificationServiceResponse> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
          error: 'AUTH_REQUIRED'
        };
      }

      const success = await NotificationRepository.markOneAsRead(notificationId, userId);

      if (!success) {
        return {
          success: false,
          message: 'Notification not found or not owned by user',
          error: 'NOTIFICATION_NOT_FOUND'
        };
      }

      logger.info(`Notification ${notificationId} marked as read by user ${userId}`);

      return {
        success: true,
        message: 'Notification marked as read successfully'
      };
    } catch (error: any) {
      logger.error('Error marking notification as read:', error);
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
  static async markAllAsRead(req: Request): Promise<NotificationServiceResponse> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
          error: 'AUTH_REQUIRED'
        };
      }

      const affectedCount = await NotificationRepository.markAllAsRead(userId);

      logger.info(`${affectedCount} notifications marked as read for user ${userId}`);

      return {
        success: true,
        message: 'All notifications marked as read successfully',
        data: {
          markedCount: affectedCount
        }
      };
    } catch (error: any) {
      logger.error('Error marking all notifications as read:', error);
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
  static async getUnreadCount(req: Request): Promise<NotificationServiceResponse> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
          error: 'AUTH_REQUIRED'
        };
      }

      const count = await NotificationRepository.getUnreadCount(userId);

      return {
        success: true,
        message: 'Unread count fetched successfully',
        data: { unreadCount: count }
      };
    } catch (error: any) {
      logger.error('Error fetching unread count:', error);
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
  static async deleteNotification(req: Request, notificationId: string): Promise<NotificationServiceResponse> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
          error: 'AUTH_REQUIRED'
        };
      }

      const success = await NotificationRepository.deleteNotification(notificationId, userId);

      if (!success) {
        return {
          success: false,
          message: 'Notification not found or not owned by user',
          error: 'NOTIFICATION_NOT_FOUND'
        };
      }

      logger.info(`Notification ${notificationId} deleted by user ${userId}`);

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error: any) {
      logger.error('Error deleting notification:', error);
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
  static async createOrderNotification(
    userId: string,
    type: NotificationType.ORDER_PLACED | NotificationType.ORDER_CONFIRMED | NotificationType.ORDER_SHIPPED | NotificationType.ORDER_DELIVERED | NotificationType.ORDER_CANCELLED,
    orderData: { orderNumber: string; orderId: string }
  ): Promise<NotificationServiceResponse> {
    const messages = {
      [NotificationType.ORDER_PLACED]: `Your order #${orderData.orderNumber} has been placed successfully`,
      [NotificationType.ORDER_CONFIRMED]: `Your order #${orderData.orderNumber} has been confirmed`,
      [NotificationType.ORDER_SHIPPED]: `Your order #${orderData.orderNumber} has been shipped`,
      [NotificationType.ORDER_DELIVERED]: `Your order #${orderData.orderNumber} has been delivered`,
      [NotificationType.ORDER_CANCELLED]: `Your order #${orderData.orderNumber} has been cancelled`
    };

    const titles = {
      [NotificationType.ORDER_PLACED]: 'Order Placed',
      [NotificationType.ORDER_CONFIRMED]: 'Order Confirmed',
      [NotificationType.ORDER_SHIPPED]: 'Order Shipped',
      [NotificationType.ORDER_DELIVERED]: 'Order Delivered',
      [NotificationType.ORDER_CANCELLED]: 'Order Cancelled'
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
  static async createDeliveryNotification(
    userId: string,
    type: NotificationType.DELIVERY_ASSIGNED | NotificationType.DELIVERY_COMPLETED,
    deliveryData: { orderId: string; orderNumber: string; deliveryPersonName?: string }
  ): Promise<NotificationServiceResponse> {
    if (type === NotificationType.DELIVERY_ASSIGNED) {
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
    } else {
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
  static async createComplaintNotification(
    userId: string,
    type: NotificationType.COMPLAINT_CREATED | NotificationType.COMPLAINT_RESOLVED,
    complaintData: { complaintId: string; complaintTitle: string }
  ): Promise<NotificationServiceResponse> {
    if (type === NotificationType.COMPLAINT_CREATED) {
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
    } else {
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
