import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  Notification,
  NotificationResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  NotificationCountResponse,
} from '../api/notification.api';

// Query keys for notifications
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => 
    [...notificationKeys.lists(), params] as const,
  counts: () => [...notificationKeys.all, 'count'] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
};

/**
 * Hook for fetching user notifications
 * @param params Optional parameters for pagination and filtering
 * @returns Query object with notifications data
 */
export const useNotifications = (params?: { 
  limit?: number; 
  offset?: number; 
  unreadOnly?: boolean;
}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook for fetching unread notification count
 * @returns Query object with unread count data
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.counts(),
    queryFn: () => getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/**
 * Hook for marking a single notification as read
 * @returns Mutation object for marking notification as read
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: (data: MarkAsReadResponse) => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Invalidate and refetch unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
      
      console.log('Notification marked as read:', data.message);
    },
    onError: (error: Error) => {
      console.error('Failed to mark notification as read:', error.message);
    },
  });
};

/**
 * Hook for marking all notifications as read
 * @returns Mutation object for marking all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: (data: MarkAllAsReadResponse) => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Invalidate and refetch unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.counts() });
      
      console.log('All notifications marked as read:', data.message);
    },
    onError: (error: Error) => {
      console.error('Failed to mark all notifications as read:', error.message);
    },
  });
};

/**
 * Hook for fetching notifications with real-time updates
 * Combines notifications list and unread count with automatic refetching
 * @param params Optional parameters for pagination and filtering
 * @returns Combined query data and loading states
 */
export const useNotificationsWithCount = (params?: { 
  limit?: number; 
  offset?: number; 
  unreadOnly?: boolean;
}) => {
  const notificationsQuery = useNotifications(params);
  const unreadCountQuery = useUnreadCount();

  const isLoading = notificationsQuery.isLoading || unreadCountQuery.isLoading;
  const isError = notificationsQuery.isError || unreadCountQuery.isError;
  const error = notificationsQuery.error || unreadCountQuery.error;

  return {
    notifications: notificationsQuery.data?.data.notifications || [],
    unreadCount: unreadCountQuery.data?.data.unreadCount || 0,
    total: notificationsQuery.data?.data.total || 0,
    isLoading,
    isError,
    error,
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
};

/**
 * Hook for notification management operations
 * Combines all notification-related hooks in one place
 * @param params Optional parameters for fetching notifications
 * @returns Complete notification management interface
 */
export const useNotificationManager = (params?: { 
  limit?: number; 
  offset?: number; 
  unreadOnly?: boolean;
}) => {
  const notificationsData = useNotificationsWithCount(params);
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();

  const markAsRead = async (notificationId: string) => {
    return markAsReadMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    return markAllAsReadMutation.mutateAsync();
  };

  const isMarkingAsRead = markAsReadMutation.isPending;
  const isMarkingAllAsRead = markAllAsReadMutation.isPending;
  const isUpdating = isMarkingAsRead || isMarkingAllAsRead;

  return {
    // Data
    ...notificationsData,
    
    // Actions
    markAsRead,
    markAllAsRead,
    
    // Loading states
    isMarkingAsRead,
    isMarkingAllAsRead,
    isUpdating,
    
    // Error states
    markAsReadError: markAsReadMutation.error,
    markAllAsReadError: markAllAsReadMutation.error,
  };
};

// Export types for external use
export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
export type UseUnreadCountReturn = ReturnType<typeof useUnreadCount>;
export type UseMarkNotificationReadReturn = ReturnType<typeof useMarkNotificationRead>;
export type UseMarkAllNotificationsReadReturn = ReturnType<typeof useMarkAllNotificationsRead>;
export type UseNotificationsWithCountReturn = ReturnType<typeof useNotificationsWithCount>;
export type UseNotificationManagerReturn = ReturnType<typeof useNotificationManager>;
