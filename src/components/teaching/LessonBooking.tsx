'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachingStore } from '@/lib/store/useTeachingStore';
import {
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface LessonBookingProps {
  teacherId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BookingStep {
  id: 'lesson' | 'schedule' | 'payment' | 'confirmation';
  title: string;
}

const STEPS: BookingStep[] = [
  { id: 'lesson', title: 'Select Lesson' },
  { id: 'schedule', title: 'Choose Time' },
  { id: 'payment', title: 'Payment' },
  { id: 'confirmation', title: 'Confirmation' },
];

export default function LessonBooking({
  teacherId,
  onSuccess,
  onCancel,
}: LessonBookingProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep['id']>('lesson');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    teachers,
    lessons,
    bookings,
    filterLessons,
    getTeacherAvailability,
    bookLesson,
  } = useTeachingStore();

  const teacher = teachers[teacherId];
  const teacherLessons = filterLessons({ teacherId });
  const availability = getTeacherAvailability(teacherId, selectedDate);

  const selectedLessonDetails = selectedLesson ? lessons[selectedLesson] : null;

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setCurrentStep('schedule');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedSlot(time);
    setCurrentStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedLesson || !selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      // Create a booking
      const bookingId = bookLesson(
        selectedLesson,
        'currentUserId', // Replace with actual user ID
        new Date(selectedDate.toDateString() + ' ' + selectedSlot).getTime()
      );

      // Initialize Stripe payment
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          lessonId: selectedLesson,
          teacherId,
          price: selectedLessonDetails?.price,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setCurrentStep('confirmation');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const renderLessonSelection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teacherLessons.map((lesson) => (
          <motion.button
            key={lesson.id}
            onClick={() => handleLessonSelect(lesson.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedLesson === lesson.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {lesson.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {lesson.description}
                </p>
              </div>
              <span className="text-xl font-bold text-indigo-600">
                ${lesson.price}
              </span>
            </div>

            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {lesson.duration} min
              </span>
              <span className="flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-1" />
                {lesson.level}
              </span>
              {lesson.maxStudents && (
                <span className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  Max {lesson.maxStudents}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderScheduleSelection = () => (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-4">
        {[...Array(14)].map((_, index) => {
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availability.map((slot, index) => (
          <motion.button
            key={index}
            disabled={!slot.available}
            onClick={() => handleTimeSelect(slot.start)}
            className={`p-4 rounded-lg text-center ${
              slot.available
                ? selectedSlot === slot.start
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={slot.available ? { scale: 1.02 } : undefined}
            whileTap={slot.available ? { scale: 0.98 } : undefined}
          >
            <span className="block text-lg font-semibold">
              {slot.start}
            </span>
            <span className="block text-sm mt-1">
              {slot.available ? 'Available' : 'Unavailable'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      {selectedLessonDetails && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Summary
          </h3>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <h4 className="font-medium">{selectedLessonDetails.title}</h4>
                <p className="text-sm text-gray-600">
                  with {teacher.name}
                </p>
              </div>
              <span className="text-xl font-bold text-indigo-600">
                ${selectedLessonDetails.price}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <span>{selectedSlot}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span>Duration</span>
              </div>
              <span>{selectedLessonDetails.duration} minutes</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay $${selectedLessonDetails.price}`}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">
        Booking Confirmed!
      </h3>
      <p className="text-gray-600">
        Your lesson has been successfully booked. You will receive a
        confirmation email shortly.
      </p>
      <button
        onClick={onSuccess}
        className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        View My Lessons
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src={teacher.avatarUrl || '/default-avatar.png'}
              alt={teacher.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Book a Lesson
            </h2>
            <p className="text-gray-600">with {teacher.name}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  STEPS.findIndex((s) => s.id === currentStep) >= index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`ml-2 text-sm ${
                  currentStep === step.id
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {step.title}
              </div>
              {index < STEPS.length - 1 && (
                <div className="mx-4 flex-1 h-0.5 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 'lesson' && renderLessonSelection()}
            {currentStep === 'schedule' && renderScheduleSelection()}
            {currentStep === 'payment' && renderPayment()}
            {currentStep === 'confirmation' && renderConfirmation()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {currentStep !== 'confirmation' && (
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={() => {
              if (currentStep === 'lesson') {
                onCancel?.();
              } else if (currentStep === 'schedule') {
                setCurrentStep('lesson');
              } else if (currentStep === 'payment') {
                setCurrentStep('schedule');
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            {currentStep === 'lesson' ? 'Cancel' : 'Back'}
          </button>
        </div>
      )}
    </div>
  );
}
