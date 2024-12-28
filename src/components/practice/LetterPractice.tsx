'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DrawingCanvas from './DrawingCanvas';
import { useBookStore } from '@/lib/store/useBookStore';
import { useAchievementStore } from '@/lib/store/useAchievementStore';

interface LetterPracticeProps {
  bookId: string;
  pageNumber: number;
  letter: {
    id: string;
    image: string;
    audio: string;
    name: string;
    description: string;
  };
}

export default function LetterPractice({
  bookId,
  pageNumber,
  letter,
}: LetterPracticeProps) {
  const [attempts, setAttempts] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const { updateProgress } = useBookStore();
  const { checkAchievements } = useAchievementStore();

  const handleDrawingComplete = (accuracy: number) => {
    setAttempts((prev) => prev + 1);
    if (accuracy > bestAccuracy) {
      setBestAccuracy(accuracy);
    }

    // Update progress if accuracy is good enough
    if (accuracy >= 80) {
      updateProgress(bookId, {
        practiceSessionsCompleted: attempts + 1,
        lastPracticedLetter: letter.id,
        practiceAccuracy: accuracy,
      });

      // Check for achievements
      checkAchievements({
        totalPracticeSessions: attempts + 1,
        bestAccuracy: accuracy,
      });
    }
  };

  const playAudio = () => {
    const audio = new Audio(letter.audio);
    audio.play();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{letter.name}</h2>
            <p className="text-gray-600">{letter.description}</p>
          </div>
          <button
            onClick={playAudio}
            className="p-3 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>
        </div>

        <DrawingCanvas
          letterImage={letter.image}
          onDrawingComplete={handleDrawingComplete}
        />

        <div className="mt-6 flex justify-between items-center">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Attempts: <span className="font-medium">{attempts}</span>
            </div>
            <div className="text-sm text-gray-600">
              Best Accuracy:{' '}
              <span className="font-medium">{Math.round(bestAccuracy)}%</span>
            </div>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-indigo-50 rounded-lg"
            >
              <h3 className="font-medium text-indigo-900 mb-2">Writing Tips:</h3>
              <ul className="list-disc list-inside text-indigo-700 space-y-1">
                <li>Start from the right side</li>
                <li>Follow the guide&apos;s stroke order</li>
                <li>Pay attention to the letter&apos;s proportions</li>
                <li>Practice the basic strokes first</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
