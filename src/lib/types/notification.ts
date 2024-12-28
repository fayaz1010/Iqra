export type NotificationType =
  | 'achievement'
  | 'challenge'
  | 'friend_request'
  | 'group_invite'
  | 'mention'
  | 'comment'
  | 'like'
  | 'reminder'
  | 'level_up'
  | 'streak';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  metadata?: {
    achievementId?: string;
    challengeId?: string;
    groupId?: string;
    postId?: string;
    level?: number;
    streak?: number;
  };
}

export interface NotificationPreferences {
  achievements: boolean;
  challenges: boolean;
  friendRequests: boolean;
  groupInvites: boolean;
  mentions: boolean;
  comments: boolean;
  likes: boolean;
  reminders: boolean;
  levelUps: boolean;
  streaks: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'system';
  reactions: Array<{
    type: string;
    userId: string;
    timestamp: number;
  }>;
  replyTo?: {
    messageId: string;
    preview: string;
  };
  metadata?: {
    imageUrl?: string;
    audioUrl?: string;
    duration?: number;
  };
}

export interface ChatGroup {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  typing?: string[];
  settings: {
    notifications: boolean;
    theme?: string;
    pinnedMessages: string[];
  };
}
