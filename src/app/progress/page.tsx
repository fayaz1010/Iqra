'use client';

import { motion } from 'framer-motion';
import { useBookStore } from '@/lib/store/useBookStore';
import { useAchievementStore } from '@/lib/store/useAchievementStore';
import AchievementCard from '@/components/achievements/AchievementCard';

const books = [
  { id: 'iqra-1', title: 'Iqra 1', totalPages: 64 },
  { id: 'iqra-2', title: 'Iqra 2', totalPages: 32 },
  { id: 'iqra-3', title: 'Iqra 3', totalPages: 32 },
  { id: 'iqra-4', title: 'Iqra 4', totalPages: 32 },
  { id: 'iqra-5', title: 'Iqra 5', totalPages: 32 },
  { id: 'iqra-6', title: 'Iqra 6', totalPages: 33 },
];

export default function ProgressPage() {
  const { bookProgress } = useBookStore();
  const { achievements, unlockedAchievements, streakDays } = useAchievementStore();

  // Calculate total progress
  const totalProgress = books.reduce((acc, book) => {
    const progress = bookProgress[book.id];
    if (!progress) return acc;
    return acc + (progress.completedPages?.length || 0);
  }, 0);

  const totalPages = books.reduce((acc, book) => acc + book.totalPages, 0);
  const progressPercentage = Math.round((totalProgress / totalPages) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Learning Journey
          </h1>
          <p className="text-lg text-gray-600">
            Track your progress across all books and practice sessions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Progress Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Overall Progress</h2>
            <div className="space-y-6">
              {books.map((book) => {
                const progress = bookProgress[book.id];
                const completedPages = progress?.completedPages?.length || 0;
                const percentage = Math.round((completedPages / book.totalPages) * 100);

                return (
                  <div key={book.id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{book.title}</span>
                      <span className="text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {Object.entries(bookProgress)
                .sort((a, b) => (b[1].lastAccessed || 0) - (a[1].lastAccessed || 0))
                .slice(0, 5)
                .map(([bookId, progress]) => {
                  const book = books.find((b) => b.id === bookId);
                  if (!book || !progress.lastAccessed) return null;

                  return (
                    <div
                      key={bookId}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-gray-600">
                          Page {progress.currentPage} of {book.totalPages}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(progress.lastAccessed).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>

          {/* Practice Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Practice Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {totalProgress}
                </div>
                <div className="text-sm text-gray-600">Pages Completed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-gray-600">Total Progress</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.values(bookProgress).reduce(
                    (acc, book) => acc + (book.notes?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Notes Created</div>
              </div>
              <div className="text-center p-4 bg-rose-50 rounded-lg">
                <div className="text-3xl font-bold text-rose-600">{streakDays}</div>
                <div className="text-sm text-gray-600">Days Streak</div>
              </div>
            </div>
          </motion.div>

          {/* Achievements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={unlockedAchievements.includes(achievement.id)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
