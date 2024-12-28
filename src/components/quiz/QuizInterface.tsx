'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizGenerator } from '@/lib/services/quizGenerator';
import { useAchievementStore } from '@/lib/store/useAchievementStore';
import { useDailyChallengeStore } from '@/lib/store/useDailyChallengeStore';

interface QuizInterfaceProps {
  userLevel: number;
  onComplete?: (score: number) => void;
  challengeId?: string;
}

export default function QuizInterface({
  userLevel,
  onComplete,
  challengeId,
}: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [timer, setTimer] = useState(0);

  const { checkAchievements } = useAchievementStore();
  const { updateChallengeProgress, completeChallenge } = useDailyChallengeStore();

  useEffect(() => {
    // Generate quiz questions
    const quiz = quizGenerator.generateQuiz(userLevel, {
      totalQuestions: 10,
      types: ['multipleChoice', 'matching', 'writing', 'audio'],
      difficulty: userLevel <= 2 ? 'easy' : userLevel <= 4 ? 'medium' : 'hard',
      topics: ['letters', 'patterns', 'pronunciation'],
    });
    setQuestions(quiz);

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [userLevel]);

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer,
    }));

    // Update challenge progress if this is a challenge
    if (challengeId) {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      updateChallengeProgress(challengeId, progress);
    }

    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const quizResults = quizGenerator.calculateScore(questions, answers);
    setResults(quizResults);
    setShowResults(true);

    // Complete challenge if applicable
    if (challengeId && quizResults.score >= quizResults.totalPossible * 0.7) {
      completeChallenge(challengeId);
    }

    // Check for achievements
    checkAchievements({
      quizCompleted: true,
      quizScore: quizResults.score,
      quizAccuracy: (quizResults.correctAnswers / questions.length) * 100,
      timeSpent: timer,
    });

    if (onComplete) {
      onComplete(quizResults.score);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion && !showResults) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>Time: {formatTime(timer)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>

              {currentQuestion.imageUrl && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {currentQuestion.audioUrl && (
                <button
                  onClick={() => {
                    const audio = new Audio(currentQuestion.audioUrl);
                    audio.play();
                  }}
                  className="mb-6 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  Play Audio
                </button>
              )}

              {/* Answer options */}
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.type === 'writing' ? (
                  <textarea
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Write your answer here..."
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                ) : (
                  currentQuestion.options?.map((option: string) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className="w-full p-4 text-left bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      {option}
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">
                  {results.score >= results.totalPossible * 0.7 ? '🎉' : '📚'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h2>
              <p className="text-gray-600">
                Time taken: {formatTime(timer)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {results.score}/{results.totalPossible}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {Math.round((results.correctAnswers / questions.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  // Navigate to review page or next section
                }}
                className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Review Answers
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
