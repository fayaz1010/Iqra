import { motion } from 'framer-motion';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Learning Journey</h1>
          <p className="text-lg text-gray-600">Track your progress and continue learning</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Continue Learning Card */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-xl p-6 card-hover">
            <div className="h-48 bg-indigo-100 rounded-xl mb-4 flex items-center justify-center">
              <svg className="w-24 h-24 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Continue Learning</h2>
            <p className="text-gray-600 mb-4">Pick up where you left off in your last session</p>
            <Link href="/books" className="text-indigo-600 font-medium hover:text-indigo-700">
              Resume Learning →
            </Link>
          </motion.div>

          {/* Quran Practice Card */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-xl p-6 card-hover">
            <div className="h-48 bg-emerald-100 rounded-xl mb-4 flex items-center justify-center">
              <svg className="w-24 h-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Quran Practice</h2>
            <p className="text-gray-600 mb-4">Apply your learning with interactive Quran exercises</p>
            <Link href="/quran" className="text-emerald-600 font-medium hover:text-emerald-700">
              Start Practice →
            </Link>
          </motion.div>

          {/* Progress Tracking Card */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-xl p-6 card-hover">
            <div className="h-48 bg-purple-100 rounded-xl mb-4 flex items-center justify-center">
              <svg className="w-24 h-24 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
            <p className="text-gray-600 mb-4">Track your learning journey and achievements</p>
            <Link href="/progress" className="text-purple-600 font-medium hover:text-purple-700">
              View Progress →
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">6</div>
            <div className="text-gray-600">Books Available</div>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">114</div>
            <div className="text-gray-600">Quran Surahs</div>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Completed Lessons</div>
          </div>
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-rose-600 mb-2">0%</div>
            <div className="text-gray-600">Overall Progress</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
