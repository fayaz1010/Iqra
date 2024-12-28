import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  level: number;
  streak: number;
  achievements: number;
  lastActive: number;
}

interface LeaderboardStats {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

interface LeaderboardState {
  leaderboards: LeaderboardStats;
  userRank: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
  loading: boolean;
  updateLeaderboard: (entry: LeaderboardEntry) => void;
  fetchLeaderboards: () => Promise<void>;
  getUserRank: (userId: string) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      leaderboards: {
        daily: [],
        weekly: [],
        monthly: [],
        allTime: [],
      },
      userRank: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        allTime: 0,
      },
      loading: false,

      updateLeaderboard: async (entry: LeaderboardEntry) => {
        set((state) => {
          // Update each time period's leaderboard
          const periods: (keyof LeaderboardStats)[] = [
            'daily',
            'weekly',
            'monthly',
            'allTime',
          ];

          const newLeaderboards = { ...state.leaderboards };

          periods.forEach((period) => {
            const leaderboard = [...newLeaderboards[period]];
            const existingIndex = leaderboard.findIndex(
              (e) => e.userId === entry.userId
            );

            if (existingIndex !== -1) {
              leaderboard[existingIndex] = entry;
            } else {
              leaderboard.push(entry);
            }

            // Sort by score in descending order
            leaderboard.sort((a, b) => b.score - a.score);

            // Keep only top 100
            newLeaderboards[period] = leaderboard.slice(0, 100);
          });

          return { leaderboards: newLeaderboards };
        });
      },

      fetchLeaderboards: async () => {
        set({ loading: true });

        try {
          // In a real implementation, this would fetch from an API
          // For now, we'll use mock data
          const mockData: LeaderboardStats = {
            daily: Array.from({ length: 10 }, (_, i) => ({
              userId: `user${i}`,
              username: `User ${i}`,
              score: Math.floor(Math.random() * 1000),
              level: Math.floor(Math.random() * 10) + 1,
              streak: Math.floor(Math.random() * 30),
              achievements: Math.floor(Math.random() * 20),
              lastActive: Date.now() - Math.random() * 86400000,
            })),
            weekly: [],
            monthly: [],
            allTime: [],
          };

          // Copy daily data to other periods with adjusted scores
          mockData.weekly = mockData.daily.map((entry) => ({
            ...entry,
            score: entry.score * 7,
          }));
          mockData.monthly = mockData.daily.map((entry) => ({
            ...entry,
            score: entry.score * 30,
          }));
          mockData.allTime = mockData.daily.map((entry) => ({
            ...entry,
            score: entry.score * 100,
          }));

          set({ leaderboards: mockData });
        } catch (error) {
          console.error('Error fetching leaderboards:', error);
        } finally {
          set({ loading: false });
        }
      },

      getUserRank: async (userId: string) => {
        const { leaderboards } = get();
        const ranks = {
          daily: 0,
          weekly: 0,
          monthly: 0,
          allTime: 0,
        };

        Object.entries(leaderboards).forEach(([period, entries]) => {
          const index = entries.findIndex((e) => e.userId === userId);
          ranks[period as keyof typeof ranks] = index + 1;
        });

        set({ userRank: ranks });
      },
    }),
    {
      name: 'leaderboard-storage',
    }
  )
);
