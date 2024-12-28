export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  experience: number;
  joinedAt: number;
  lastActive: number;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      dailyReminder: boolean;
      achievements: boolean;
      friendActivity: boolean;
      challenges: boolean;
    };
    privacy: {
      showProgress: boolean;
      showActivity: boolean;
      allowFriendRequests: boolean;
    };
  };
  stats: {
    totalPagesRead: number;
    totalTimeSpent: number;
    averageAccuracy: number;
    practiceStreak: number;
    challengesCompleted: number;
    achievementsUnlocked: number;
  };
  social: {
    friends: string[];
    studyGroups: string[];
    following: string[];
    followers: string[];
  };
  recentActivity: Array<{
    type: 'achievement' | 'challenge' | 'practice' | 'book' | 'social';
    action: string;
    timestamp: number;
    details: Record<string, any>;
  }>;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  createdAt: number;
  createdBy: string;
  members: Array<{
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: number;
  }>;
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    maxMembers: number;
  };
  stats: {
    totalMembers: number;
    activeMembers: number;
    averageLevel: number;
    totalPracticeTime: number;
  };
  activities: Array<{
    type: 'practice' | 'challenge' | 'discussion';
    title: string;
    description: string;
    startTime: number;
    endTime?: number;
    participants: string[];
  }>;
}

export interface SocialInteraction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'mention';
  userId: string;
  targetId: string;
  targetType: 'achievement' | 'challenge' | 'practice' | 'post';
  content?: string;
  timestamp: number;
  reactions?: Array<{
    type: string;
    userId: string;
    timestamp: number;
  }>;
}
