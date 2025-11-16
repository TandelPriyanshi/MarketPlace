import { axiosInstance } from './index';

export interface Notification {
  id: string;
  userId: string;
  type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 
        'payment_received' | 'payment_failed' | 'complaint_created' | 'complaint_resolved' | 
        'product_low_stock' | 'delivery_assigned' | 'delivery_completed' | 'system_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
    total: number;
  };
}

export interface NotificationCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
  data: {
    markedCount: number;
  };
}

export interface CreateNotificationRequest {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface CreateNotificationResponse {
  success: boolean;
  message: string;
  data: Notification;
}

/**
 * Get logged-in user notifications
 * @param params Optional parameters for pagination and filtering
 * @returns Promise<NotificationResponse>
 */
export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params?.unreadOnly) {
      queryParams.append('unreadOnly', params.unreadOnly.toString());
    }

    const response = await axiosInstance.get(
      `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

/**
 * Get unread notification count
 * @returns Promise<NotificationCountResponse>
 */
export const getUnreadCount = async (): Promise<NotificationCountResponse> => {
  try {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
  }
};

/**
 * Mark single notification as read
 * @param id Notification ID
 * @returns Promise<MarkAsReadResponse>
 */
export const markAsRead = async (id: string): Promise<MarkAsReadResponse> => {
  try {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 * @returns Promise<MarkAllAsReadResponse>
 */
export const markAllAsRead = async (): Promise<MarkAllAsReadResponse> => {
  try {
    const response = await axiosInstance.put('/notifications/readAll');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

/**
 * Create notification (Admin only)
 * @param notificationData Notification data
 * @returns Promise<CreateNotificationResponse>
 */
export const createNotification = async (
  notificationData: CreateNotificationRequest
): Promise<CreateNotificationResponse> => {
  try {
    const response = await axiosInstance.post('/notifications', notificationData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create notification');
  }
};

/**
 * Create multiple notifications (Admin only)
 * @param notifications Array of notification data
 * @returns Promise<{ success: boolean; message: string; data: Notification[] }>
 */
export const createBulkNotifications = async (
  notifications: CreateNotificationRequest[]
): Promise<{ success: boolean; message: string; data: Notification[] }> => {
  try {
    const response = await axiosInstance.post('/notifications/bulk', { notifications });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create bulk notifications');
  }
};

/**
 * Delete notification
 * @param id Notification ID
 * @returns Promise<{ success: boolean; message: string }>
 */
export const deleteNotification = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
};

// Helper functions for specific notification types
export const NotificationTypes = {
  ORDER_PLACED: 'order_placed' as const,
  ORDER_CONFIRMED: 'order_confirmed' as const,
  ORDER_SHIPPED: 'order_shipped' as const,
  ORDER_DELIVERED: 'order_delivered' as const,
  ORDER_CANCELLED: 'order_cancelled' as const,
  PAYMENT_RECEIVED: 'payment_received' as const,
  PAYMENT_FAILED: 'payment_failed' as const,
  COMPLAINT_CREATED: 'complaint_created' as const,
  COMPLAINT_RESOLVED: 'complaint_resolved' as const,
  PRODUCT_LOW_STOCK: 'product_low_stock' as const,
  DELIVERY_ASSIGNED: 'delivery_assigned' as const,
  DELIVERY_COMPLETED: 'delivery_completed' as const,
  SYSTEM_UPDATE: 'system_update' as const,
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];
