import React from 'react';
import { Check, CheckCircle, Package, Truck, AlertCircle, Info, X } from 'lucide-react';
import { useNotificationManager } from '../../hooks/useNotifications';
import { Notification, NotificationTypes } from '../../api/notification.api';

interface NotificationListProps {
  onClose?: () => void;
  compact?: boolean;
  maxItems?: number;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  onClose, 
  compact = false, 
  maxItems 
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    isMarkingAsRead,
    isLoading,
    error 
  } = useNotificationManager();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Handle notification-specific actions
    if (notification.data?.orderId) {
      // Navigate to order details if order data exists
      console.log('Navigate to order:', notification.data.orderId);
    }
    
    onClose?.();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      case NotificationTypes.ORDER_PLACED:
      case NotificationTypes.ORDER_CONFIRMED:
      case NotificationTypes.ORDER_SHIPPED:
      case NotificationTypes.ORDER_DELIVERED:
      case NotificationTypes.ORDER_CANCELLED:
        return <Package className={`${iconClass} text-blue-600`} />;
      case NotificationTypes.DELIVERY_ASSIGNED:
      case NotificationTypes.DELIVERY_COMPLETED:
        return <Truck className={`${iconClass} text-green-600`} />;
      case NotificationTypes.COMPLAINT_CREATED:
      case NotificationTypes.COMPLAINT_RESOLVED:
        return <AlertCircle className={`${iconClass} text-orange-600`} />;
      case NotificationTypes.PAYMENT_RECEIVED:
      case NotificationTypes.PAYMENT_FAILED:
        return <Info className={`${iconClass} text-purple-600`} />;
      case NotificationTypes.PRODUCT_LOW_STOCK:
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case NotificationTypes.SYSTEM_UPDATE:
        return <Info className={`${iconClass} text-gray-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    if (notification.isRead) {
      return 'bg-white hover:bg-gray-50';
    }
    
    switch (notification.type) {
      case NotificationTypes.ORDER_PLACED:
      case NotificationTypes.ORDER_CONFIRMED:
      case NotificationTypes.ORDER_SHIPPED:
      case NotificationTypes.ORDER_DELIVERED:
        return 'bg-blue-50 hover:bg-blue-100';
      case NotificationTypes.DELIVERY_ASSIGNED:
      case NotificationTypes.DELIVERY_COMPLETED:
        return 'bg-green-50 hover:bg-green-100';
      case NotificationTypes.COMPLAINT_CREATED:
      case NotificationTypes.COMPLAINT_RESOLVED:
        return 'bg-orange-50 hover:bg-orange-100';
      case NotificationTypes.PAYMENT_RECEIVED:
        return 'bg-purple-50 hover:bg-purple-100';
      case NotificationTypes.PAYMENT_FAILED:
      case NotificationTypes.PRODUCT_LOW_STOCK:
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const displayNotifications = maxItems 
    ? notifications.slice(0, maxItems) 
    : notifications;

  // Loading state
  if (isLoading && notifications.length === 0) {
    return (
      <div className={`p-4 ${compact ? 'py-2' : ''}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${compact ? 'py-2' : ''}`}>
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Failed to load notifications</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className={`p-4 ${compact ? 'py-2' : ''}`}>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mb-2 text-gray-400" />
          <p className="text-center">
            {unreadCount === 0 ? 'No notifications' : 'No new notifications'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'py-1' : 'py-2'}>
      {displayNotifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`
            relative flex items-start gap-3 p-3 cursor-pointer transition-colors duration-200
            border-b border-gray-100 last:border-b-0
            ${getNotificationColor(notification)}
          `}
        >
          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          )}
          
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                  {notification.title}
                </p>
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
              </div>
              
              {/* Read indicator */}
              {notification.isRead && (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            {/* Timestamp */}
            <p className="text-xs text-gray-400 mt-2">
              {formatTimeAgo(notification.createdAt)}
            </p>
          </div>
        </div>
      ))}
      
      {/* Show more indicator if truncated */}
      {maxItems && notifications.length > maxItems && (
        <div className="p-3 text-center">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {notifications.length} notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
