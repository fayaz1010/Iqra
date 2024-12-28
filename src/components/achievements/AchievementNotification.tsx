import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/lib/store/useAchievementStore';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({
  achievement,
  onClose,
}: AchievementNotificationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="font-medium">{achievement.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-white/80 mt-1">{achievement.description}</p>
          </div>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5 }}
          className="absolute bottom-0 left-0 h-1 bg-white/20"
          onAnimationComplete={onClose}
        />
      </motion.div>
    </AnimatePresence>
  );
}
