import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useBookStore } from '@/lib/store/useBookStore';

const books = [
  {
    id: 'iqra-1',
    title: 'Iqra 1',
    description: 'Foundation of Arabic letters and basic pronunciation',
    image: '/images/iqra1.jpg',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'iqra-2',
    title: 'Iqra 2',
    description: 'Introduction to letter combinations and simple words',
    image: '/images/iqra2.jpg',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'iqra-3',
    title: 'Iqra 3',
    description: 'Advanced letter combinations and word formation',
    image: '/images/iqra3.jpg',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'iqra-4',
    title: 'Iqra 4',
    description: 'Basic Quranic words and short verses',
    image: '/images/iqra4.jpg',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'iqra-5',
    title: 'Iqra 5',
    description: 'Intermediate Quranic verses and tajweed rules',
    image: '/images/iqra5.jpg',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'iqra-6',
    title: 'Iqra 6',
    description: 'Advanced Quranic reading and comprehensive tajweed',
    image: '/images/iqra6.jpg',
    color: 'from-indigo-500 to-blue-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Iqra Learning Books
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start your journey of learning Arabic and Quranic reading with our
          interactive Iqra books series.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {books.map((book) => (
          <motion.div
            key={book.id}
            variants={item}
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${book.color} mix-blend-multiply opacity-20 group-hover:opacity-30 transition-opacity`} />
            
            <div className="relative p-6">
              <div className="aspect-[3/4] relative mb-6 rounded-lg overflow-hidden">
                <Image
                  src={book.image}
                  alt={book.title}
                  layout="fill"
                  objectFit="cover"
                  className="transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {book.title}
              </h2>
              <p className="text-gray-600 mb-6">{book.description}</p>

              <Link
                href={`/books/${book.id}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Learning
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
