import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFViewer from '@/components/books/PDFViewer';
import NoteEditor from '@/components/books/NoteEditor';
import { useBookStore } from '@/lib/store/useBookStore';

const books = [
  { id: 'iqra-1', title: 'Iqra 1', url: '/books/iqra-1.pdf' },
  { id: 'iqra-2', title: 'Iqra 2', url: '/books/iqra-2.pdf' },
  { id: 'iqra-3', title: 'Iqra 3', url: '/books/iqra-3.pdf' },
  { id: 'iqra-4', title: 'Iqra 4', url: '/books/iqra-4.pdf' },
  { id: 'iqra-5', title: 'Iqra 5', url: '/books/iqra-5.pdf' },
  { id: 'iqra-6', title: 'Iqra 6', url: '/books/iqra-6.pdf' },
];

export default function BookPage({ params }: { params: { id: string } }) {
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const { bookProgress, addNote, updateNote, deleteNote } = useBookStore();

  const book = books.find((b) => b.id === params.id);
  const notes = bookProgress[params.id]?.notes || [];

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Book not found</h1>
      </div>
    );
  }

  const handleAddNote = () => {
    const currentPage = bookProgress[params.id]?.currentPage || 1;
    addNote(params.id, {
      pageNumber: currentPage,
      content: '',
      color: '#FDE68A',
      position: { x: 50, y: 50 },
    });
    setIsNoteEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Note
          </button>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1">
            <PDFViewer url={book.url} bookId={params.id} />
          </div>

          {/* Notes sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 hidden lg:block"
          >
            <div className="sticky top-24 bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="space-y-4">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    layoutId={note.id}
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setActiveNote(note.id);
                      setIsNoteEditorOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">
                        Page {note.pageNumber}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(params.id, note.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                    <div
                      className="prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </motion.div>
                ))}

                {notes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No notes yet. Click "Add Note" to create one.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isNoteEditorOpen && activeNote && (
            <NoteEditor
              content={
                notes.find((n) => n.id === activeNote)?.content || ''
              }
              onChange={(content) => {
                updateNote(params.id, activeNote, content);
              }}
              onClose={() => {
                setIsNoteEditorOpen(false);
                setActiveNote(null);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
