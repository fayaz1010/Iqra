'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChallengeStore } from '@/lib/store/useDailyChallengeStore';

const challengeIcons = {
  writing: '✍️',
  pattern: '🔍',
  pronunciation: '🗣️',
  quiz: '📝',
};

const challengeDescriptions = {
  writing: 'Practice writing Arabic letters',
  pattern: 'Find patterns in Quranic text',
  pronunciation: 'Practice letter pronunciation',
  quiz: 'Test your knowledge',
};

export default function DailyChallenges() {
  const {
    currentChallenges,
    completedChallenges,
    currentStreak,
    generateDailyChallenges,
    getStreakBonus,
  } = useDailyChallengeStore();

  // Generate new challenges if needed
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasCurrentChallenges = currentChallenges.some((c) => c.date === today);
    
    if (!hasCurrentChallenges) {
      generateDailyChallenges(1); // Pass user's current level
    }
  }, [currentChallenges, generateDailyChallenges]);

  const streakBonus = getStreakBonus();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Streak Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Daily Streak: {currentStreak} days</h2>
            <p className="text-indigo-100">
              Current Bonus: +{streakBonus}% XP on all challenges
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
        <div className="mt-4 bg-white/10 rounded-lg p-2">
          <div className="text-sm">
            Complete daily challenges to maintain your streak!
          </div>
        </div>
      </motion.div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {currentChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl mb-2">
                      {challengeIcons[challenge.type]}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      Daily {challenge.type}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {challengeDescriptions[challenge.type]}
                    </p>
                  </div>
                  <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-600 text-sm font-medium">
                    +{challenge.reward.xp} XP
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Navigate to challenge
                  }}
                  className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {challenge.progress > 0 ? 'Continue' : 'Start'} Challenge
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:col-span-2 mt-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Completed Challenges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4"
                >
                  <div className="text-2xl">{challengeIcons[challenge.type]}</div>
                  <div>
                    <div className="font-medium capitalize">
                      {challenge.type} Challenge
                    </div>
                    <div className="text-sm text-gray-600">
                      +{challenge.reward.xp} XP earned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
