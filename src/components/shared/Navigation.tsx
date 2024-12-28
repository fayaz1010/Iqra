import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'Quran', path: '/quran' },
    { name: 'Progress', path: '/progress' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Iqra</span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-indigo-600"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
