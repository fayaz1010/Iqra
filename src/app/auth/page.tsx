import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Iqra</h1>
            <p className="text-gray-600">Begin your journey of learning</p>
          </div>
          <AuthForm />
        </div>
      </motion.div>
    </div>
  );
}
