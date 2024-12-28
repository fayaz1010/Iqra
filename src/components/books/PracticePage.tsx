import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Point {
  x: number;
  y: number;
}

interface PracticeArea {
  id: string;
  points: Point[];
  letter: string;
  audioUrl?: string;
}

interface PracticePageProps {
  bookId: string;
  pageNumber: number;
  practiceAreas: PracticeArea[];
  onComplete: () => void;
}

export default function PracticePage({
  bookId,
  pageNumber,
  practiceAreas,
  onComplete,
}: PracticePageProps) {
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completedAreas, setCompletedAreas] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [drawnPaths, setDrawnPaths] = useState<Point[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawnPaths.forEach(path => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });

    // Draw current path
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [currentPath, drawnPaths]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedArea) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !selectedArea) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !selectedArea) return;
    setIsDrawing(false);
    setDrawnPaths(prev => [...prev, currentPath]);
    setCurrentPath([]);

    // Check if the drawing matches the practice area
    if (checkDrawingAccuracy(currentPath, selectedArea.points)) {
      setCompletedAreas(prev => [...prev, selectedArea.id]);
      playSuccessSound();
      if (selectedArea.audioUrl) {
        playLetterSound(selectedArea.audioUrl);
      }
    }
  };

  const checkDrawingAccuracy = (drawn: Point[], target: Point[]): boolean => {
    // Implement drawing recognition logic here
    // This is a simplified version - you might want to use a more sophisticated algorithm
    return true;
  };

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play();
  };

  const playLetterSound = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative aspect-[3/4] bg-white rounded-lg shadow-lg overflow-hidden">
        <Image
          src={`/books/${bookId}/page-${pageNumber}.png`}
          alt={`Page ${pageNumber}`}
          layout="fill"
          objectFit="contain"
          className="pointer-events-none"
        />
        
        <canvas
          ref={canvasRef}
          width={800}
          height={1200}
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {practiceAreas.map((area) => (
          <motion.button
            key={area.id}
            className={`absolute ${
              completedAreas.includes(area.id)
                ? 'bg-green-200'
                : selectedArea?.id === area.id
                ? 'bg-indigo-200'
                : 'bg-gray-200'
            } rounded-full p-2 hover:bg-indigo-100 transition-colors`}
            style={{
              left: `${area.points[0].x}%`,
              top: `${area.points[0].y}%`,
            }}
            onClick={() => setSelectedArea(area)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {area.letter}
          </motion.button>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        
        <button
          onClick={() => {
            setDrawnPaths([]);
            setCurrentPath([]);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Clear
        </button>

        {completedAreas.length === practiceAreas.length && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onComplete}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-2">How to Practice</h3>
            <ol className="list-decimal list-inside text-gray-600">
              <li>Click on a letter to select it</li>
              <li>Draw the letter following the pattern</li>
              <li>Complete all letters to proceed</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
