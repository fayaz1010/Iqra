'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Invalid session');
      setLoading(false);
      return;
    }

    // Verify the payment with your backend
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Payment Error
          </h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/lessons')}
            className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Return to Lessons
          </button>
        </div>
      </div>
    );
  }

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
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-2xl font-bold text-gray-900"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-gray-600"
          >
            Your lesson has been booked successfully. You will receive a
            confirmation email with all the details shortly.
          </motion.p>

          <div className="mt-8 space-y-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => router.push('/lessons/upcoming')}
              className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              View My Lessons
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Return to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
