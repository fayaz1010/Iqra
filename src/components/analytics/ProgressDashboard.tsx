'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookStore } from '@/lib/store/useBookStore';
import { useAchievementStore } from '@/lib/store/useAchievementStore';
import { useDailyChallengeStore } from '@/lib/store/useDailyChallengeStore';

interface ProgressStats {
  totalPagesRead: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  completedBooks: number;
  practiceStreak: number;
  challengesCompleted: number;
  achievementsUnlocked: number;
}

interface ActivityData {
  date: string;
  pagesRead: number;
  timeSpent: number;
  accuracy: number;
}

export default function ProgressDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>(
    'week'
  );
  const [stats, setStats] = useState<ProgressStats>({
    totalPagesRead: 0,
    totalTimeSpent: 0,
    averageAccuracy: 0,
    completedBooks: 0,
    practiceStreak: 0,
    challengesCompleted: 0,
    achievementsUnlocked: 0,
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  const { bookProgress } = useBookStore();
  const { achievements, unlockedAchievements } = useAchievementStore();
  const { completedChallenges, currentStreak } = useDailyChallengeStore();

  useEffect(() => {
    // Calculate stats
    const calculatedStats: ProgressStats = {
      totalPagesRead: Object.values(bookProgress).reduce(
        (acc, book) => acc + (book.completedPages?.length || 0),
        0
      ),
      totalTimeSpent: Object.values(bookProgress).reduce(
        (acc, book) => acc + (book.timeSpent || 0),
        0
      ),
      averageAccuracy: Object.values(bookProgress).reduce(
        (acc, book, index, array) =>
          acc + (book.averageAccuracy || 0) / array.length,
        0
      ),
      completedBooks: Object.values(bookProgress).filter(
        (book) => book.completed
      ).length,
      practiceStreak: currentStreak,
      challengesCompleted: completedChallenges.length,
      achievementsUnlocked: unlockedAchievements.length,
    };

    setStats(calculatedStats);

    // Generate activity data
    const now = new Date();
    const data: ActivityData[] = [];
    const daysToShow = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // In a real implementation, this would come from actual user data
      data.unshift({
        date: dateString,
        pagesRead: Math.floor(Math.random() * 10),
        timeSpent: Math.floor(Math.random() * 60),
        accuracy: 70 + Math.random() * 30,
      });
    }

    setActivityData(data);
  }, [
    bookProgress,
    selectedPeriod,
    completedChallenges,
    currentStreak,
    unlockedAchievements,
  ]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="text-sm text-gray-600 mb-2">Total Pages Read</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalPagesRead}
          </div>
          <div className="mt-2 text-sm text-green-600">
            +{Math.floor(stats.totalPagesRead * 0.1)} this week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="text-sm text-gray-600 mb-2">Learning Time</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatTime(stats.totalTimeSpent)}
          </div>
          <div className="mt-2 text-sm text-green-600">
            +{formatTime(Math.floor(stats.totalTimeSpent * 0.05))} this week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="text-sm text-gray-600 mb-2">Average Accuracy</div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(stats.averageAccuracy)}%
          </div>
          <div className="mt-2 text-sm text-green-600">+2% improvement</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="text-sm text-gray-600 mb-2">Practice Streak</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.practiceStreak} days
          </div>
          <div className="mt-2 text-sm text-green-600">Keep it up! 🔥</div>
        </motion.div>
      </div>

      {/* Activity Graph */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Learning Activity</h2>
          <div className="flex space-x-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg ${
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 relative">
          {/* Activity bars */}
          <div className="absolute inset-0 flex items-end">
            {activityData.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.pagesRead / 10) * 100}%` }}
                transition={{ delay: index * 0.02 }}
                className="flex-1 mx-1 bg-indigo-600 rounded-t-sm"
                style={{
                  opacity: 0.2 + (day.accuracy / 100) * 0.8,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.achievementsUnlocked}
              </div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {achievements.length - stats.achievementsUnlocked}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Daily Challenges
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.challengesCompleted}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round((stats.challengesCompleted / 30) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Monthly Goal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
