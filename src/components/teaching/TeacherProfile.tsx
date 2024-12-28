'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachingStore } from '@/lib/store/useTeachingStore';
import { Teacher } from '@/lib/types/teaching';
import Image from 'next/image';
import { StarIcon, CalendarIcon, AcademicCapIcon, ClockIcon, ChatBubbleLeftIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface TeacherProfileProps {
  teacherId: string;
  onBookLesson?: (teacherId: string) => void;
  onStartChat?: (teacherId: string) => void;
}

export default function TeacherProfile({
  teacherId,
  onBookLesson,
  onStartChat,
}: TeacherProfileProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'reviews'>(
    'about'
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { teachers, getTeacherStats, getTeacherAvailability } = useTeachingStore();
  const teacher = teachers[teacherId];

  if (!teacher) return null;

  const stats = getTeacherStats(teacherId);
  const availability = getTeacherAvailability(teacherId, selectedDate);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderQualifications = () => (
    <div className="space-y-4">
      {teacher.qualifications.map((qual, index) => (
        <div key={index} className="flex items-start space-x-3">
          <AcademicCapIcon className="w-6 h-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-medium text-gray-900">{qual.degree}</h4>
            <p className="text-sm text-gray-600">
              {qual.institution} • {qual.year}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-4">
        {[...Array(7)].map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center p-3 rounded-lg min-w-[80px] ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-semibold">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {availability.map((slot, index) => (
          <button
            key={index}
            disabled={!slot.available}
            className={`w-full p-3 rounded-lg flex items-center justify-between ${
              slot.available
                ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>{slot.start} - {slot.end}</span>
            </span>
            {slot.available && (
              <span className="text-sm font-medium">Available</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {teacher.ratings.average.toFixed(1)}
          </h3>
          {renderStars(teacher.ratings.average)}
          <p className="text-sm text-gray-600 mt-1">
            {teacher.ratings.total} reviews
          </p>
        </div>
        <div className="space-y-2">
          {Object.entries(teacher.ratings.breakdown)
            .reverse()
            .map(([rating, count]) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-3">{rating}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(count / teacher.ratings.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          <div className="relative -mt-20 w-32 h-32">
            <Image
              src={teacher.avatarUrl || '/default-avatar.png'}
              alt={teacher.name}
              fill
              className="rounded-2xl border-4 border-white shadow-lg object-cover"
            />
          </div>
          <div className="mt-6 sm:mt-0 flex-grow">
            <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
            <p className="text-lg text-gray-600">{teacher.title}</p>
            <div className="mt-2 flex items-center space-x-4">
              {renderStars(teacher.ratings.average)}
              <span className="text-sm text-gray-600">
                ({teacher.ratings.total} reviews)
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 flex space-x-3">
            {onStartChat && (
              <button
                onClick={() => onStartChat(teacherId)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                Message
              </button>
            )}
            {onBookLesson && (
              <button
                onClick={() => onBookLesson(teacherId)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <VideoCameraIcon className="w-5 h-5 mr-2" />
                Book Lesson
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Students',
              value: stats.totalStudents,
              icon: '👥',
            },
            {
              label: 'Lessons Given',
              value: stats.totalLessons,
              icon: '📚',
            },
            {
              label: 'Teaching Hours',
              value: Math.round(stats.totalHours),
              icon: '⏰',
            },
            {
              label: 'Completion Rate',
              value: `${Math.round(stats.completionRate)}%`,
              icon: '✅',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 text-center"
            >
              <span className="text-2xl">{stat.icon}</span>
              <div className="mt-2 font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'about', label: 'About' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-1 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Bio</h3>
                    <p className="mt-2 text-gray-600">{teacher.bio}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Specializations
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {teacher.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Education & Qualifications
                    </h3>
                    <div className="mt-2">{renderQualifications()}</div>
                  </div>
                </div>
              )}
              {activeTab === 'schedule' && renderSchedule()}
              {activeTab === 'reviews' && renderReviews()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
