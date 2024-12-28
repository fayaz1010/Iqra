import { motion } from 'framer-motion';
import { Achievement } from '@/lib/store/useAchievementStore';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export default function AchievementCard({
  achievement,
  isUnlocked,
}: AchievementCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-lg ${
        isUnlocked
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      <div className="absolute top-2 right-2">
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-yellow-300"
          >
            ⭐
          </motion.div>
        )}
      </div>

      <div className="text-4xl mb-2">{achievement.icon}</div>
      <h3 className="font-bold mb-1">{achievement.title}</h3>
      <p className="text-sm">{achievement.description}</p>

      {isUnlocked && achievement.unlockedAt && (
        <div className="mt-2 text-xs opacity-75">
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}

      {!isUnlocked && (
        <div className="mt-2 text-sm">
          Progress: 0/{achievement.requirement.count}{' '}
          {achievement.requirement.type.replace('_', ' ')}
        </div>
      )}
    </motion.div>
  );
}
