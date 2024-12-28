'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LetterPractice from './LetterPractice';
import { useBookStore } from '@/lib/store/useBookStore';
import { useAchievementStore } from '@/lib/store/useAchievementStore';

interface PracticeSessionProps {
  bookId: string;
  pageNumber: number;
  letters: Array<{
    id: string;
    image: string;
    audio: string;
    name: string;
    description: string;
  }>;
}

export default function PracticeSession({
  bookId,
  pageNumber,
  letters,
}: PracticeSessionProps) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalAttempts: 0,
    averageAccuracy: 0,
    timeSpent: 0,
  });

  const { updateProgress } = useBookStore();
  const { checkAchievements } = useAchievementStore();

  // Timer for tracking practice duration
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setSessionStats((prev) => ({ ...prev, timeSpent: duration }));
    };
  }, []);

  const handleLetterComplete = (accuracy: number) => {
    if (accuracy >= 80) {
      // Update session stats
      setSessionStats((prev) => ({
        totalAttempts: prev.totalAttempts + 1,
        averageAccuracy: (prev.averageAccuracy + accuracy) / 2,
        timeSpent: prev.timeSpent,
      }));

      // Move to next letter or complete session
      if (currentLetterIndex < letters.length - 1) {
        setCurrentLetterIndex((prev) => prev + 1);
      } else {
        completeSession();
      }
    }
  };

  const completeSession = () => {
    setSessionComplete(true);

    // Update book progress
    updateProgress(bookId, {
      lastCompletedPage: pageNumber,
      practiceSessionsCompleted: sessionStats.totalAttempts,
      averageAccuracy: sessionStats.averageAccuracy,
    });

    // Check for achievements
    checkAchievements({
      totalPracticeSessions: sessionStats.totalAttempts,
      averageAccuracy: sessionStats.averageAccuracy,
      timeSpent: sessionStats.timeSpent,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Letter {currentLetterIndex + 1} of {letters.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentLetterIndex / letters.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(currentLetterIndex / letters.length) * 100}%`,
              }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!sessionComplete ? (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LetterPractice
                bookId={bookId}
                pageNumber={pageNumber}
                letter={letters[currentLetterIndex]}
              />
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Practice Complete!
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {sessionStats.totalAttempts}
                  </div>
                  <div className="text-sm text-gray-600">Total Attempts</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(sessionStats.averageAccuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Accuracy</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.floor(sessionStats.timeSpent / 60)}m{' '}
                    {sessionStats.timeSpent % 60}s
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setCurrentLetterIndex(0);
                    setSessionComplete(false);
                    setSessionStats({
                      totalAttempts: 0,
                      averageAccuracy: 0,
                      timeSpent: 0,
                    });
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Practice Again
                </button>
                <button
                  onClick={() => {
                    // Navigate to next page or section
                  }}
                  className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
