import { useEffect } from 'react';
import { useBookStore } from '@/lib/store/useBookStore';
import { useAchievementStore } from '@/lib/store/useAchievementStore';
import toast from 'react-hot-toast';

export function useAchievements() {
  const { bookProgress } = useBookStore();
  const {
    achievements,
    unlockedAchievements,
    unlockAchievement,
    updateStreak,
    checkAchievements,
  } = useAchievementStore();

  useEffect(() => {
    // Update streak on component mount
    updateStreak();

    // Calculate statistics
    const stats = {
      totalPagesRead: Object.values(bookProgress).reduce(
        (acc, book) => acc + (book.completedPages?.length || 0),
        0
      ),
      totalPracticeSessions: Object.values(bookProgress).reduce(
        (acc, book) => acc + (book.practiceSessionsCompleted || 0),
        0
      ),
      booksCompleted: Object.values(bookProgress).reduce(
        (acc, book) =>
          acc + (book.completedPages?.length === book.totalPages ? 1 : 0),
        0
      ),
      quranVersesRead: Object.values(bookProgress).reduce(
        (acc, book) => acc + (book.quranVersesRead || 0),
        0
      ),
    };

    // Check for new achievements
    checkAchievements(stats);
  }, [bookProgress, updateStreak, checkAchievements]);

  // Function to show achievement notification
  const showAchievementNotification = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (achievement) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="text-2xl">{achievement.icon}</div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    Achievement Unlocked!
                  </p>
                  <p className="mt-1 text-sm">
                    {achievement.title} - {achievement.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-indigo-400">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-100 hover:text-white focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'bottom-right',
        }
      );
    }
  };

  return {
    showAchievementNotification,
  };
}
