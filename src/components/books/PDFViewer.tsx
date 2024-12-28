import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookStore } from '@/lib/store/useBookStore';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  bookId: string;
}

export default function PDFViewer({ url, bookId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const { updateProgress, bookProgress } = useBookStore();

  useEffect(() => {
    // Load saved progress
    const savedProgress = bookProgress[bookId];
    if (savedProgress?.currentPage) {
      setPageNumber(savedProgress.currentPage);
    }
  }, [bookId, bookProgress]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    updateProgress(bookId, {
      totalPages: numPages,
      currentPage: pageNumber,
    });
  }

  function changePage(offset: number) {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
      updateProgress(bookId, {
        currentPage: newPage,
        completedPages: [
          ...(bookProgress[bookId]?.completedPages || []),
          pageNumber,
        ],
      });
    }
  }

  function handleZoom(factor: number) {
    setScale((prevScale) => {
      const newScale = prevScale * factor;
      return Math.min(Math.max(newScale, 0.5), 2.0); // Limit zoom between 50% and 200%
    });
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-lg shadow-sm p-4 mb-4"
      >
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= (numPages || 1)}
              className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(0.9)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              -
            </button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => handleZoom(1.1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>
      </motion.div>

      {/* PDF Document */}
      <div className="w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center p-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg rounded-lg overflow-hidden"
              renderAnnotationLayer={false}
              renderTextLayer={true}
            />
          </motion.div>
        </Document>
      </div>
    </div>
  );
}
