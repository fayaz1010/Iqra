import { Suspense } from 'react';
import QuranReader from '@/components/quran/QuranReader';
import { motion } from 'framer-motion';

export default function QuranPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quran Practice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Apply your Iqra learning with interactive Quran reading practice.
            Recognize patterns, practice pronunciation, and track your progress.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }
        >
          <QuranReader />
        </Suspense>
      </motion.div>
    </div>
  );
}
