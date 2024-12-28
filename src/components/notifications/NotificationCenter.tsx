'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { NotificationType } from '@/lib/types/notification';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>(
    'all'
  );

  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences,
  } = useNotificationStore();

  useEffect(() => {
    // Request notification permissions if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'challenge':
        return '🎯';
      case 'friend_request':
        return '👥';
      case 'group_invite':
        return '👋';
      case 'mention':
        return '@';
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'reminder':
        return '⏰';
      case 'level_up':
        return '⭐';
      case 'streak':
        return '🔥';
      default:
        return '📢';
    }
  };

  const filteredNotifications = Object.values(notifications)
    .filter((notification) =>
      selectedType === 'all' ? true : notification.type === selectedType
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="p-2 border-b overflow-x-auto">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedType === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {[
                  'achievement',
                  'challenge',
                  'friend_request',
                  'group_invite',
                  'mention',
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as NotificationType)}
                    className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                      selectedType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] overflow-y-auto">
              <AnimatePresence initial={false}>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 border-b ${
                        !notification.read ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {notification.message}
                              </p>
                              {notification.sender && (
                                <p className="text-sm text-gray-500 mt-1">
                                  From {notification.sender.username}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                View
                              </a>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No notifications to show
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Footer */}
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  // Open notification settings
                }}
                className="w-full px-4 py-2 text-sm text-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Notification Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
