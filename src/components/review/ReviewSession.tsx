'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spacedRepetition } from '@/lib/services/spacedRepetition';

interface ReviewItem {
  id: string;
  type: 'letter' | 'pattern' | 'word';
  content: string;
  level: number;
  lastReviewed: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  consecutiveCorrect: number;
}

interface ReviewSessionProps {
  items: ReviewItem[];
  onComplete?: (results: any) => void;
}

export default function ReviewSession({ items, onComplete }: ReviewSessionProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<
    Array<{
      itemId: string;
      quality: number;
      timestamp: number;
    }>
  >([]);

  const currentItem = items[currentItemIndex];

  const handleQualityRating = (quality: number) => {
    // Update results
    setResults((prev) => ({
      ...prev,
      [currentItem.id]: quality,
    }));

    // Add to review history
    setReviewHistory((prev) => [
      ...prev,
      {
        itemId: currentItem.id,
        quality,
        timestamp: Date.now(),
      },
    ]);

    // Move to next item or complete session
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setSessionComplete(true);
    if (onComplete) {
      onComplete({
        results,
        history: reviewHistory,
        timestamp: Date.now(),
      });
    }
  };

  const getQualityDescription = (quality: number) => {
    switch (quality) {
      case 5:
        return 'Perfect recall';
      case 4:
        return 'Correct after a hesitation';
      case 3:
        return 'Correct with difficulty';
      case 2:
        return 'Incorrect but remembered after seeing';
      case 1:
        return 'Incorrect but familiar';
      case 0:
        return 'Complete blackout';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {!sessionComplete ? (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Item {currentItemIndex + 1} of {items.length}
                </span>
                <span>
                  {Math.round(((currentItemIndex + 1) / items.length) * 100)}%
                  Complete
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentItemIndex + 1) / items.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>

            {/* Review item */}
            <div className="text-center mb-8">
              <div className="text-sm text-gray-600 mb-2">
                {currentItem.type.charAt(0).toUpperCase() +
                  currentItem.type.slice(1)}
              </div>
              <div className="text-6xl font-arabic mb-4">
                {currentItem.content}
              </div>

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    {/* Answer content would go here */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {/* Example answer content */}
                      <h3 className="font-medium text-gray-900 mb-2">
                        Pronunciation Guide
                      </h3>
                      <p className="text-gray-600">
                        This letter makes the sound &quot;...&quot;
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Show Answer
                </button>
              ) : (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    How well did you remember this?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[5, 4, 3, 2, 1, 0].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => handleQualityRating(quality)}
                        className="p-4 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900">
                          {quality === 5 ? 'Perfect' : quality}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getQualityDescription(quality)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review Complete!
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {items.length}
                </div>
                <div className="text-sm text-gray-600">Items Reviewed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {Object.values(results).reduce((a, b) => a + b, 0) /
                    Object.values(results).length}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Review Again
              </button>
              <button
                onClick={() => {
                  // Navigate to next section or dashboard
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
  );
}
