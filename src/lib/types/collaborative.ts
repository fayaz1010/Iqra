export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  members: Array<{
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: number;
  }>;
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    allowAnnotations: boolean;
    allowSharing: boolean;
  };
  content: {
    pages: WorkspacePage[];
    resources: Resource[];
    annotations: Annotation[];
    comments: Comment[];
  };
}

export interface WorkspacePage {
  id: string;
  title: string;
  content: string;
  order: number;
  lastModified: number;
  modifiedBy: string;
  version: number;
  history: Array<{
    content: string;
    modifiedBy: string;
    timestamp: number;
    version: number;
  }>;
}

export interface Resource {
  id: string;
  type: 'document' | 'image' | 'audio' | 'video' | 'link';
  title: string;
  description?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: number;
  size?: number;
  metadata?: {
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    mimeType?: string;
  };
}

export interface Annotation {
  id: string;
  pageId: string;
  type: 'highlight' | 'note' | 'drawing' | 'audio';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  style?: {
    color: string;
    opacity: number;
    strokeWidth?: number;
  };
  createdBy: string;
  createdAt: number;
  lastModified: number;
  replies: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
  lastModified: number;
  parentId?: string;
  mentions: string[];
  reactions: Array<{
    type: string;
    userId: string;
    timestamp: number;
  }>;
}

export interface GameElement {
  id: string;
  type: 'badge' | 'achievement' | 'reward' | 'quest';
  title: string;
  description: string;
  imageUrl?: string;
  requirements: {
    type: 'count' | 'streak' | 'time' | 'score';
    target: number;
    progress: number;
  };
  rewards: Array<{
    type: 'points' | 'badge' | 'item' | 'feature';
    value: number | string;
    claimed: boolean;
  }>;
  status: 'locked' | 'in_progress' | 'completed' | 'claimed';
  unlockedAt?: number;
  expiresAt?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  tasks: Array<{
    id: string;
    description: string;
    completed: boolean;
    progress: number;
    target: number;
  }>;
  rewards: Array<{
    type: 'points' | 'badge' | 'item';
    value: number | string;
  }>;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'expired';
}

export interface CollaborationSession {
  id: string;
  type: 'study' | 'practice' | 'quiz';
  title: string;
  description?: string;
  host: string;
  participants: Array<{
    userId: string;
    role: 'host' | 'participant';
    joinedAt: number;
    status: 'active' | 'idle' | 'away';
  }>;
  settings: {
    maxParticipants: number;
    allowJoinRequests: boolean;
    allowChat: boolean;
    allowVoice: boolean;
    allowVideo: boolean;
    recordSession: boolean;
  };
  status: 'scheduled' | 'active' | 'ended';
  startTime: number;
  endTime?: number;
  resources: Resource[];
  chat: {
    messages: Array<{
      id: string;
      senderId: string;
      content: string;
      timestamp: number;
      type: 'text' | 'system' | 'action';
    }>;
  };
}
