'use client';

import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center"
          >
            <XCircleIcon className="w-12 h-12 text-red-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-2xl font-bold text-gray-900"
          >
            Payment Cancelled
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-gray-600"
          >
            Your payment was cancelled. No charges were made to your account.
          </motion.p>

          <div className="mt-8 space-y-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => router.back()}
              className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Try Again
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => router.push('/lessons')}
              className="w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Return to Lessons
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
