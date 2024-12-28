import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { patternMatcher } from '../services/patternMatcher';

interface Challenge {
  id: string;
  date: string;
  type: 'writing' | 'pattern' | 'pronunciation' | 'quiz';
  completed: boolean;
  progress: number;
  reward: {
    xp: number;
    streakBonus: number;
  };
}

interface DailyChallengeState {
  currentChallenges: Challenge[];
  completedChallenges: Challenge[];
  currentStreak: number;
  lastCompletedDate: string | null;
  
  generateDailyChallenges: (userLevel: number) => void;
  completeChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  getStreakBonus: () => number;
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      currentChallenges: [],
      completedChallenges: [],
      currentStreak: 0,
      lastCompletedDate: null,

      generateDailyChallenges: (userLevel: number) => {
        const today = new Date().toISOString().split('T')[0];
        const patterns = patternMatcher.getPatternsByLevel(userLevel);

        // Generate challenges based on user's level
        const challenges: Challenge[] = [
          {
            id: `writing-${today}`,
            date: today,
            type: 'writing',
            completed: false,
            progress: 0,
            reward: {
              xp: 50,
              streakBonus: 10,
            },
          },
          {
            id: `pattern-${today}`,
            date: today,
            type: 'pattern',
            completed: false,
            progress: 0,
            reward: {
              xp: 30,
              streakBonus: 5,
            },
          },
          {
            id: `pronunciation-${today}`,
            date: today,
            type: 'pronunciation',
            completed: false,
            progress: 0,
            reward: {
              xp: 40,
              streakBonus: 8,
            },
          },
          {
            id: `quiz-${today}`,
            date: today,
            type: 'quiz',
            completed: false,
            progress: 0,
            reward: {
              xp: 60,
              streakBonus: 12,
            },
          },
        ];

        set({ currentChallenges: challenges });
      },

      completeChallenge: (challengeId: string) => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const challenge = state.currentChallenges.find((c) => c.id === challengeId);
          
          if (!challenge) return state;

          // Update streak
          let newStreak = state.currentStreak;
          if (state.lastCompletedDate !== today) {
            const lastDate = state.lastCompletedDate
              ? new Date(state.lastCompletedDate)
              : new Date(0);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }

          // Move challenge to completed
          const updatedCurrentChallenges = state.currentChallenges.filter(
            (c) => c.id !== challengeId
          );
          const updatedCompletedChallenges = [
            ...state.completedChallenges,
            { ...challenge, completed: true, progress: 100 },
          ];

          return {
            currentChallenges: updatedCurrentChallenges,
            completedChallenges: updatedCompletedChallenges,
            currentStreak: newStreak,
            lastCompletedDate: today,
          };
        });
      },

      updateChallengeProgress: (challengeId: string, progress: number) => {
        set((state) => ({
          currentChallenges: state.currentChallenges.map((challenge) =>
            challenge.id === challengeId
              ? { ...challenge, progress: Math.min(100, progress) }
              : challenge
          ),
        }));
      },

      getStreakBonus: () => {
        const { currentStreak } = get();
        // Bonus increases with streak, caps at 100%
        return Math.min(Math.floor(currentStreak / 7) * 20, 100);
      },
    }),
    {
      name: 'daily-challenge-storage',
    }
  )
);
