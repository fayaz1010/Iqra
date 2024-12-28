import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Notification,
  NotificationType,
  NotificationPreferences,
} from '../types/notification';

interface NotificationState {
  notifications: Record<string, Notification>;
  preferences: NotificationPreferences;
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;

  // Preference actions
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  toggleNotificationType: (type: NotificationType) => void;
  setQuietHours: (start: string, end: string) => void;

  // Utility actions
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  shouldShowNotification: (type: NotificationType) => boolean;
}

const defaultPreferences: NotificationPreferences = {
  achievements: true,
  challenges: true,
  friendRequests: true,
  groupInvites: true,
  mentions: true,
  comments: true,
  likes: true,
  reminders: true,
  levelUps: true,
  streaks: true,
  emailNotifications: true,
  pushNotifications: true,
  dailyDigest: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: {},
      preferences: defaultPreferences,
      unreadCount: 0,
      loading: false,
      error: null,

      addNotification: (notification) => {
        const id = `notification_${Date.now()}`;
        const newNotification = { ...notification, id, read: false };

        set((state) => ({
          notifications: {
            ...state.notifications,
            [id]: newNotification,
          },
          unreadCount: state.unreadCount + 1,
        }));

        // Show browser notification if enabled
        if (
          get().preferences.pushNotifications &&
          get().shouldShowNotification(notification.type)
        ) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/app-icon.png',
            });
          }
        }

        return id;
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [notificationId]: {
              ...state.notifications[notificationId],
              read: true,
            },
          },
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: Object.fromEntries(
            Object.entries(state.notifications).map(([id, notification]) => [
              id,
              { ...notification, read: true },
            ])
          ),
          unreadCount: 0,
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const { [notificationId]: removed, ...rest } = state.notifications;
          return {
            notifications: rest,
            unreadCount: removed?.read
              ? state.unreadCount
              : Math.max(0, state.unreadCount - 1),
          };
        });
      },

      clearAll: () => {
        set({ notifications: {}, unreadCount: 0 });
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        }));
      },

      toggleNotificationType: (type) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [type]: !state.preferences[type as keyof NotificationPreferences],
          },
        }));
      },

      setQuietHours: (start, end) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            quietHours: {
              ...state.preferences.quietHours,
              enabled: true,
              start,
              end,
            },
          },
        }));
      },

      getUnreadNotifications: () => {
        const { notifications } = get();
        return Object.values(notifications).filter(
          (notification) => !notification.read
        );
      },

      getNotificationsByType: (type) => {
        const { notifications } = get();
        return Object.values(notifications).filter(
          (notification) => notification.type === type
        );
      },

      shouldShowNotification: (type) => {
        const { preferences } = get();
        if (!preferences[type as keyof NotificationPreferences]) return false;

        if (preferences.quietHours.enabled) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
          const { start, end } = preferences.quietHours;

          if (start <= end) {
            return !(currentTime >= start && currentTime <= end);
          } else {
            return !(currentTime >= start || currentTime <= end);
          }
        }

        return true;
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);
