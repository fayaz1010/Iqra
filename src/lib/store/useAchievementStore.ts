import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'pages_read' | 'practice_sessions' | 'streak' | 'books_completed' | 'quran_verses';
    count: number;
  };
  unlockedAt?: number;
}

interface AchievementStore {
  achievements: Achievement[];
  unlockedAchievements: string[];
  streakDays: number;
  lastLoginDate: string | null;
  unlockAchievement: (id: string) => void;
  checkAchievements: (stats: any) => void;
  updateStreak: () => void;
}

const achievements: Achievement[] = [
  {
    id: 'first_page',
    title: 'First Steps',
    description: 'Read your first page',
    icon: '📖',
    requirement: { type: 'pages_read', count: 1 },
  },
  {
    id: 'practice_master',
    title: 'Practice Master',
    description: 'Complete 10 practice sessions',
    icon: '✍️',
    requirement: { type: 'practice_sessions', count: 10 },
  },
  {
    id: 'streak_week',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    requirement: { type: 'streak', count: 7 },
  },
  {
    id: 'first_book',
    title: 'Book Champion',
    description: 'Complete your first book',
    icon: '🏆',
    requirement: { type: 'books_completed', count: 1 },
  },
  {
    id: 'quran_beginner',
    title: 'Quran Explorer',
    description: 'Read 10 verses in the Quran',
    icon: '🌟',
    requirement: { type: 'quran_verses', count: 10 },
  },
  {
    id: 'dedication',
    title: 'Dedicated Learner',
    description: 'Maintain a 30-day learning streak',
    icon: '👑',
    requirement: { type: 'streak', count: 30 },
  },
];

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements,
      unlockedAchievements: [],
      streakDays: 0,
      lastLoginDate: null,

      unlockAchievement: (id: string) =>
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;

          // Show achievement notification
          const achievement = state.achievements.find((a) => a.id === id);
          if (achievement) {
            // You can implement a toast notification here
            console.log(`Achievement unlocked: ${achievement.title}`);
          }

          return {
            unlockedAchievements: [...state.unlockedAchievements, id],
          };
        }),

      checkAchievements: (stats: any) => {
        const { unlockAchievement } = get();
        
        // Check each achievement
        achievements.forEach((achievement) => {
          const { requirement } = achievement;
          
          switch (requirement.type) {
            case 'pages_read':
              if (stats.totalPagesRead >= requirement.count) {
                unlockAchievement(achievement.id);
              }
              break;
            case 'practice_sessions':
              if (stats.totalPracticeSessions >= requirement.count) {
                unlockAchievement(achievement.id);
              }
              break;
            case 'streak':
              if (stats.currentStreak >= requirement.count) {
                unlockAchievement(achievement.id);
              }
              break;
            case 'books_completed':
              if (stats.booksCompleted >= requirement.count) {
                unlockAchievement(achievement.id);
              }
              break;
            case 'quran_verses':
              if (stats.quranVersesRead >= requirement.count) {
                unlockAchievement(achievement.id);
              }
              break;
          }
        });
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastLogin = state.lastLoginDate;

          if (!lastLogin) {
            return {
              streakDays: 1,
              lastLoginDate: today,
            };
          }

          const lastLoginDate = new Date(lastLogin);
          const currentDate = new Date(today);
          const diffDays = Math.floor(
            (currentDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            // Consecutive day
            return {
              streakDays: state.streakDays + 1,
              lastLoginDate: today,
            };
          } else if (diffDays > 1) {
            // Streak broken
            return {
              streakDays: 1,
              lastLoginDate: today,
            };
          }

          return state;
        });
      },
    }),
    {
      name: 'achievement-storage',
    }
  )
);
