import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotificationManager } from '../../hooks/useNotifications';
import NotificationList from '@/components/notifications/NotificationList';

interface NotificationBellProps {
  className?: string;
  showDropdown?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = '', 
  showDropdown = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    unreadCount, 
    markAllAsRead, 
    isMarkingAllAsRead,
    isLoading 
  } = useNotificationManager({ limit: 10 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const hasUnreadNotifications = unreadCount > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={showDropdown ? handleToggleDropdown : undefined}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${showDropdown ? 'hover:bg-gray-100 cursor-pointer' : ''}
          ${hasUnreadNotifications ? 'text-blue-600' : 'text-gray-600'}
        `}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {hasUnreadNotifications ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Unread Count Badge */}
        {hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {hasUnreadNotifications && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            <NotificationList 
              onClose={() => setIsOpen(false)}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
