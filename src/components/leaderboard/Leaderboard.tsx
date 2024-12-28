'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboardStore } from '@/lib/store/useLeaderboardStore';

type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('daily');
  const { leaderboards, userRank, loading, fetchLeaderboards } = useLeaderboardStore();

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  const formatScore = (score: number) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Period Selector */}
      <div className="flex space-x-2 mb-8">
        {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === period
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* User's Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Ranking</h2>
            <p className="text-indigo-100">
              {userRank[selectedPeriod]
                ? `#${userRank[selectedPeriod]} on the ${selectedPeriod} leaderboard`
                : 'Not ranked yet'}
            </p>
          </div>
          <div className="text-4xl">👑</div>
        </div>
      </motion.div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right">Level</div>
              <div className="col-span-2 text-right">Streak</div>
              <div className="col-span-1 text-right">Last Active</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center py-12"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </motion.div>
              ) : (
                leaderboards[selectedPeriod].map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 px-6 py-4 ${
                      entry.userId === 'currentUser'
                        ? 'bg-indigo-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      {index + 1 <= 3 ? (
                        <span className="text-2xl">
                          {['🥇', '🥈', '🥉'][index]}
                        </span>
                      ) : (
                        <span className="text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                    <div className="col-span-4 flex items-center">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-medium">
                            {entry.username.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {entry.username}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-medium text-gray-900">
                      {formatScore(entry.score)}
                    </div>
                    <div className="col-span-2 text-right text-gray-600">
                      Level {entry.level}
                    </div>
                    <div className="col-span-2 text-right text-gray-600">
                      {entry.streak} days 🔥
                    </div>
                    <div className="col-span-1 text-right text-gray-500 text-sm">
                      {formatTimeAgo(entry.lastActive)}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Achievement Showcase */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Achievers</h3>
          <div className="space-y-4">
            {leaderboards[selectedPeriod]
              .slice(0, 3)
              .map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">
                      {['🥇', '🥈', '🥉'][index]}
                    </span>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <span className="text-gray-600">
                    {entry.achievements} achievements
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Longest Streaks</h3>
          <div className="space-y-4">
            {[...leaderboards[selectedPeriod]]
              .sort((a, b) => b.streak - a.streak)
              .slice(0, 3)
              .map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">
                      {['🔥', '🔥', '🔥'][index]}
                    </span>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <span className="text-gray-600">{entry.streak} days</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Most Active</h3>
          <div className="space-y-4">
            {[...leaderboards[selectedPeriod]]
              .sort((a, b) => b.lastActive - a.lastActive)
              .slice(0, 3)
              .map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">
                      {['⚡', '⚡', '⚡'][index]}
                    </span>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <span className="text-gray-600">
                    {formatTimeAgo(entry.lastActive)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
