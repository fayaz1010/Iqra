import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Note {
  id: string;
  pageNumber: number;
  content: string;
  color: string;
  position: { x: number; y: number };
  createdAt: number;
}

interface BookProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  completedPages: number[];
  notes: Note[];
  lastAccessed: number;
}

interface BookStore {
  currentBook: string | null;
  bookProgress: Record<string, BookProgress>;
  setCurrentBook: (bookId: string) => void;
  updateProgress: (bookId: string, progress: Partial<BookProgress>) => void;
  addNote: (bookId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (bookId: string, noteId: string) => void;
  updateNote: (bookId: string, noteId: string, content: string) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set) => ({
      currentBook: null,
      bookProgress: {},
      
      setCurrentBook: (bookId) => set({ currentBook: bookId }),
      
      updateProgress: (bookId, progress) =>
        set((state) => ({
          bookProgress: {
            ...state.bookProgress,
            [bookId]: {
              ...state.bookProgress[bookId],
              ...progress,
              lastAccessed: Date.now(),
            },
          },
        })),
      
      addNote: (bookId, note) =>
        set((state) => {
          const currentNotes = state.bookProgress[bookId]?.notes || [];
          const newNote = {
            ...note,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
          };
          
          return {
            bookProgress: {
              ...state.bookProgress,
              [bookId]: {
                ...state.bookProgress[bookId],
                notes: [...currentNotes, newNote],
                lastAccessed: Date.now(),
              },
            },
          };
        }),
      
      deleteNote: (bookId, noteId) =>
        set((state) => ({
          bookProgress: {
            ...state.bookProgress,
            [bookId]: {
              ...state.bookProgress[bookId],
              notes: state.bookProgress[bookId].notes.filter(
                (note) => note.id !== noteId
              ),
              lastAccessed: Date.now(),
            },
          },
        })),
      
      updateNote: (bookId, noteId, content) =>
        set((state) => ({
          bookProgress: {
            ...state.bookProgress,
            [bookId]: {
              ...state.bookProgress[bookId],
              notes: state.bookProgress[bookId].notes.map((note) =>
                note.id === noteId ? { ...note, content } : note
              ),
              lastAccessed: Date.now(),
            },
          },
        })),
    }),
    {
      name: 'book-storage',
    }
  )
);
