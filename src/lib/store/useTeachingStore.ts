import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Teacher,
  Lesson,
  LessonBooking,
  Question,
  TeachingSession,
} from '../types/teaching';

interface TeachingState {
  teachers: Record<string, Teacher>;
  lessons: Record<string, Lesson>;
  bookings: Record<string, LessonBooking>;
  questions: Record<string, Question>;
  sessions: Record<string, TeachingSession>;
  activeSession: string | null;
  loading: boolean;
  error: string | null;

  // Teacher actions
  registerTeacher: (teacher: Omit<Teacher, 'id'>) => string;
  updateTeacherProfile: (teacherId: string, updates: Partial<Teacher>) => void;
  updateTeacherAvailability: (
    teacherId: string,
    availability: Teacher['availability']
  ) => void;
  addTeacherRating: (
    teacherId: string,
    rating: number,
    feedback?: string
  ) => void;

  // Lesson actions
  createLesson: (lesson: Omit<Lesson, 'id'>) => string;
  updateLesson: (lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (lessonId: string) => void;
  searchLessons: (query: string) => Lesson[];
  filterLessons: (filters: {
    category?: string;
    level?: Lesson['level'];
    type?: Lesson['type'];
    price?: { min?: number; max?: number };
  }) => Lesson[];

  // Booking actions
  bookLesson: (
    lessonId: string,
    studentId: string,
    startTime: number
  ) => string;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  addBookingFeedback: (
    bookingId: string,
    rating: number,
    comment: string
  ) => void;

  // Question actions
  askQuestion: (question: Omit<Question, 'id' | 'answers'>) => string;
  answerQuestion: (
    questionId: string,
    answer: Question['answers'][0]
  ) => void;
  updateQuestionStatus: (
    questionId: string,
    status: Question['status']
  ) => void;
  voteAnswer: (questionId: string, answerId: string) => void;

  // Session actions
  startSession: (session: Omit<TeachingSession, 'id'>) => string;
  joinSession: (
    sessionId: string,
    userId: string,
    role: TeachingSession['participants'][0]['role']
  ) => void;
  leaveSession: (sessionId: string, userId: string) => void;
  endSession: (sessionId: string) => void;
  sendSessionMessage: (
    sessionId: string,
    message: Omit<TeachingSession['media']['chat'][0], 'id' | 'timestamp'>
  ) => void;
  updateParticipantPermissions: (
    sessionId: string,
    userId: string,
    permissions: TeachingSession['participants'][0]['permissions']
  ) => void;
  shareResource: (
    sessionId: string,
    resource: Omit<TeachingSession['resources'][0], 'id' | 'sharedAt'>
  ) => void;

  // Utility actions
  getTeacherAvailability: (teacherId: string, date: Date) => {
    start: string;
    end: string;
    available: boolean;
  }[];
  getUpcomingLessons: (userId: string) => LessonBooking[];
  getPastLessons: (userId: string) => LessonBooking[];
  getTeacherStats: (teacherId: string) => Teacher['stats'];
  searchQuestions: (query: string) => Question[];
}

export const useTeachingStore = create<TeachingState>()(
  persist(
    (set, get) => ({
      teachers: {},
      lessons: {},
      bookings: {},
      questions: {},
      sessions: {},
      activeSession: null,
      loading: false,
      error: null,

      registerTeacher: (teacher) => {
        const teacherId = `teacher_${Date.now()}`;
        set((state) => ({
          teachers: {
            ...state.teachers,
            [teacherId]: {
              id: teacherId,
              ...teacher,
              ratings: {
                average: 0,
                total: 0,
                breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              },
              stats: {
                totalLessons: 0,
                totalStudents: 0,
                totalHours: 0,
                completionRate: 100,
              },
            },
          },
        }));
        return teacherId;
      },

      updateTeacherProfile: (teacherId, updates) => {
        set((state) => ({
          teachers: {
            ...state.teachers,
            [teacherId]: {
              ...state.teachers[teacherId],
              ...updates,
            },
          },
        }));
      },

      updateTeacherAvailability: (teacherId, availability) => {
        set((state) => ({
          teachers: {
            ...state.teachers,
            [teacherId]: {
              ...state.teachers[teacherId],
              availability,
            },
          },
        }));
      },

      addTeacherRating: (teacherId, rating, feedback) => {
        set((state) => {
          const teacher = state.teachers[teacherId];
          const newTotal = teacher.ratings.total + 1;
          const newAverage =
            (teacher.ratings.average * teacher.ratings.total + rating) / newTotal;
          const newBreakdown = {
            ...teacher.ratings.breakdown,
            [rating]: teacher.ratings.breakdown[rating] + 1,
          };

          return {
            teachers: {
              ...state.teachers,
              [teacherId]: {
                ...teacher,
                ratings: {
                  average: newAverage,
                  total: newTotal,
                  breakdown: newBreakdown,
                },
              },
            },
          };
        });
      },

      createLesson: (lesson) => {
        const lessonId = `lesson_${Date.now()}`;
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              id: lessonId,
              ...lesson,
            },
          },
        }));
        return lessonId;
      },

      updateLesson: (lessonId, updates) => {
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              ...state.lessons[lessonId],
              ...updates,
            },
          },
        }));
      },

      deleteLesson: (lessonId) => {
        set((state) => {
          const { [lessonId]: deleted, ...rest } = state.lessons;
          return { lessons: rest };
        });
      },

      searchLessons: (query) => {
        const { lessons } = get();
        const lowercaseQuery = query.toLowerCase();
        return Object.values(lessons).filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(lowercaseQuery) ||
            lesson.description.toLowerCase().includes(lowercaseQuery) ||
            lesson.tags.some((tag) =>
              tag.toLowerCase().includes(lowercaseQuery)
            )
        );
      },

      filterLessons: (filters) => {
        const { lessons } = get();
        return Object.values(lessons).filter((lesson) => {
          if (filters.category && lesson.category !== filters.category)
            return false;
          if (filters.level && lesson.level !== filters.level) return false;
          if (filters.type && lesson.type !== filters.type) return false;
          if (
            filters.price &&
            ((filters.price.min && lesson.price < filters.price.min) ||
              (filters.price.max && lesson.price > filters.price.max))
          )
            return false;
          return true;
        });
      },

      bookLesson: (lessonId, studentId, startTime) => {
        const bookingId = `booking_${Date.now()}`;
        const lesson = get().lessons[lessonId];
        set((state) => ({
          bookings: {
            ...state.bookings,
            [bookingId]: {
              id: bookingId,
              lessonId,
              teacherId: lesson.teacherId,
              studentId,
              status: 'pending',
              startTime,
              endTime: startTime + lesson.duration * 60 * 1000,
              price: lesson.price,
              paymentStatus: 'pending',
            },
          },
        }));
        return bookingId;
      },

      confirmBooking: (bookingId) => {
        set((state) => ({
          bookings: {
            ...state.bookings,
            [bookingId]: {
              ...state.bookings[bookingId],
              status: 'confirmed',
            },
          },
        }));
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: {
            ...state.bookings,
            [bookingId]: {
              ...state.bookings[bookingId],
              status: 'cancelled',
            },
          },
        }));
      },

      addBookingFeedback: (bookingId, rating, comment) => {
        set((state) => ({
          bookings: {
            ...state.bookings,
            [bookingId]: {
              ...state.bookings[bookingId],
              feedback: {
                rating,
                comment,
                timestamp: Date.now(),
              },
            },
          },
        }));
      },

      askQuestion: (question) => {
        const questionId = `question_${Date.now()}`;
        set((state) => ({
          questions: {
            ...state.questions,
            [questionId]: {
              id: questionId,
              ...question,
              answers: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
        }));
        return questionId;
      },

      answerQuestion: (questionId, answer) => {
        set((state) => ({
          questions: {
            ...state.questions,
            [questionId]: {
              ...state.questions[questionId],
              answers: [...state.questions[questionId].answers, answer],
              updatedAt: Date.now(),
            },
          },
        }));
      },

      updateQuestionStatus: (questionId, status) => {
        set((state) => ({
          questions: {
            ...state.questions,
            [questionId]: {
              ...state.questions[questionId],
              status,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      voteAnswer: (questionId, answerId) => {
        set((state) => ({
          questions: {
            ...state.questions,
            [questionId]: {
              ...state.questions[questionId],
              answers: state.questions[questionId].answers.map((answer) =>
                answer.id === answerId
                  ? { ...answer, votes: answer.votes + 1 }
                  : answer
              ),
            },
          },
        }));
      },

      startSession: (session) => {
        const sessionId = `session_${Date.now()}`;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              id: sessionId,
              ...session,
              status: 'live',
              startTime: Date.now(),
              media: {
                chat: [],
              },
              resources: [],
            },
          },
          activeSession: sessionId,
        }));
        return sessionId;
      },

      joinSession: (sessionId, userId, role) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              participants: [
                ...state.sessions[sessionId].participants,
                {
                  userId,
                  role,
                  joinedAt: Date.now(),
                  permissions: {
                    audio: role === 'teacher',
                    video: role === 'teacher',
                    screen: role === 'teacher',
                    chat: true,
                    whiteboard: role === 'teacher',
                  },
                },
              ],
            },
          },
        }));
      },

      leaveSession: (sessionId, userId) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              participants: state.sessions[sessionId].participants.map((p) =>
                p.userId === userId ? { ...p, leftAt: Date.now() } : p
              ),
            },
          },
        }));
      },

      endSession: (sessionId) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              status: 'ended',
              endTime: Date.now(),
            },
          },
          activeSession: null,
        }));
      },

      sendSessionMessage: (sessionId, message) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              media: {
                ...state.sessions[sessionId].media,
                chat: [
                  ...state.sessions[sessionId].media.chat,
                  {
                    id: `message_${Date.now()}`,
                    ...message,
                    timestamp: Date.now(),
                  },
                ],
              },
            },
          },
        }));
      },

      updateParticipantPermissions: (sessionId, userId, permissions) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              participants: state.sessions[sessionId].participants.map((p) =>
                p.userId === userId ? { ...p, permissions } : p
              ),
            },
          },
        }));
      },

      shareResource: (sessionId, resource) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              resources: [
                ...state.sessions[sessionId].resources,
                {
                  id: `resource_${Date.now()}`,
                  ...resource,
                  sharedAt: Date.now(),
                },
              ],
            },
          },
        }));
      },

      getTeacherAvailability: (teacherId, date) => {
        const { teachers } = get();
        const teacher = teachers[teacherId];
        if (!teacher) return [];

        const dayOfWeek = date
          .toLocaleDateString('en-US', { weekday: 'lowercase' })
          .split(',')[0] as keyof typeof teacher.availability.schedule[0];

        const schedule = teacher.availability.schedule.find(
          (s) => s.day === dayOfWeek
        );
        return schedule?.slots || [];
      },

      getUpcomingLessons: (userId) => {
        const { bookings } = get();
        return Object.values(bookings).filter(
          (booking) =>
            booking.studentId === userId &&
            booking.status === 'confirmed' &&
            booking.startTime > Date.now()
        );
      },

      getPastLessons: (userId) => {
        const { bookings } = get();
        return Object.values(bookings).filter(
          (booking) =>
            booking.studentId === userId &&
            booking.status === 'completed' &&
            booking.endTime < Date.now()
        );
      },

      getTeacherStats: (teacherId) => {
        const { teachers, bookings } = get();
        const teacher = teachers[teacherId];
        if (!teacher) return teacher?.stats;

        const teacherBookings = Object.values(bookings).filter(
          (booking) => booking.teacherId === teacherId
        );

        const completedBookings = teacherBookings.filter(
          (booking) => booking.status === 'completed'
        );

        return {
          totalLessons: teacherBookings.length,
          totalStudents: new Set(
            teacherBookings.map((booking) => booking.studentId)
          ).size,
          totalHours: completedBookings.reduce(
            (total, booking) =>
              total + (booking.endTime - booking.startTime) / (60 * 60 * 1000),
            0
          ),
          completionRate:
            (completedBookings.length / teacherBookings.length) * 100 || 100,
        };
      },

      searchQuestions: (query) => {
        const { questions } = get();
        const lowercaseQuery = query.toLowerCase();
        return Object.values(questions).filter(
          (question) =>
            question.title.toLowerCase().includes(lowercaseQuery) ||
            question.content.toLowerCase().includes(lowercaseQuery)
        );
      },
    }),
    {
      name: 'teaching-storage',
    }
  )
);
