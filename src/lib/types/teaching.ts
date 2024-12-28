export interface Teacher {
  id: string;
  userId: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  specializations: string[];
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
    verificationUrl?: string;
  }>;
  experience: Array<{
    role: string;
    organization: string;
    startYear: number;
    endYear?: number;
    description: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
  }>;
  availability: {
    schedule: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      slots: Array<{
        start: string; // HH:mm format
        end: string; // HH:mm format
        available: boolean;
      }>;
    }>;
    timezone: string;
  };
  ratings: {
    average: number;
    total: number;
    breakdown: Record<number, number>; // 1-5 stars
  };
  stats: {
    totalLessons: number;
    totalStudents: number;
    totalHours: number;
    completionRate: number;
  };
}

export interface Lesson {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  type: 'one-on-one' | 'group' | 'workshop' | 'webinar';
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  duration: number; // in minutes
  price: number;
  maxStudents?: number;
  prerequisites?: string[];
  objectives: string[];
  syllabus: Array<{
    title: string;
    description: string;
    duration: number;
  }>;
  resources: Array<{
    type: 'document' | 'video' | 'audio' | 'link';
    title: string;
    url: string;
  }>;
  settings: {
    allowRecording: boolean;
    requiresCamera: boolean;
    requiresMicrophone: boolean;
    allowChat: boolean;
    allowQA: boolean;
  };
}

export interface LessonBooking {
  id: string;
  lessonId: string;
  teacherId: string;
  studentId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startTime: number;
  endTime: number;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  meetingUrl?: string;
  recording?: {
    url: string;
    duration: number;
    size: number;
  };
  feedback?: {
    rating: number;
    comment: string;
    timestamp: number;
  };
}

export interface Question {
  id: string;
  studentId: string;
  teacherId?: string;
  title: string;
  content: string;
  type: 'general' | 'lesson-specific' | 'homework' | 'technical';
  status: 'open' | 'answered' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  lessonId?: string;
  attachments?: Array<{
    type: 'image' | 'document' | 'audio';
    url: string;
    name: string;
  }>;
  answers: Array<{
    id: string;
    teacherId: string;
    content: string;
    timestamp: number;
    accepted: boolean;
    votes: number;
    attachments?: Array<{
      type: 'image' | 'document' | 'audio';
      url: string;
      name: string;
    }>;
  }>;
}

export interface TeachingSession {
  id: string;
  type: 'lesson' | 'office-hours' | 'qa';
  teacherId: string;
  lessonId?: string;
  status: 'scheduled' | 'live' | 'ended';
  startTime: number;
  endTime?: number;
  participants: Array<{
    userId: string;
    role: 'teacher' | 'student' | 'assistant';
    joinedAt: number;
    leftAt?: number;
    permissions: {
      audio: boolean;
      video: boolean;
      screen: boolean;
      chat: boolean;
      whiteboard: boolean;
    };
  }>;
  media: {
    recording?: {
      status: 'recording' | 'processing' | 'ready';
      url?: string;
      duration?: number;
    };
    whiteboard?: {
      enabled: boolean;
      data: any; // Whiteboard state
    };
    chat: Array<{
      id: string;
      userId: string;
      content: string;
      type: 'text' | 'question' | 'answer' | 'system';
      timestamp: number;
      reactions?: Array<{
        type: string;
        userId: string;
      }>;
    }>;
  };
  resources: Array<{
    id: string;
    type: 'document' | 'video' | 'audio' | 'link';
    title: string;
    url: string;
    sharedAt: number;
    sharedBy: string;
  }>;
}
