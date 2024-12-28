'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  letterImage: string;
  onDrawingComplete?: (accuracy: number) => void;
  width?: number;
  height?: number;
}

export default function DrawingCanvas({
  letterImage,
  onDrawingComplete,
  width = 400,
  height = 400,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);

        // Draw guide image
        const img = new Image();
        img.src = letterImage;
        img.onload = () => {
          ctx.globalAlpha = 0.2;
          ctx.drawImage(img, 0, 0, width, height);
          ctx.globalAlpha = 1;
        };
      }
    }
  }, [letterImage, width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPoints([newPoint]);
    context.beginPath();
    context.moveTo(newPoint.x, newPoint.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPoints((prev) => [...prev, newPoint]);
    context.lineTo(newPoint.x, newPoint.y);
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing || !context) return;

    setIsDrawing(false);
    context.closePath();

    // Calculate accuracy (simplified version)
    const accuracy = calculateAccuracy(points);
    if (onDrawingComplete) {
      onDrawingComplete(accuracy);
    }

    // Provide feedback
    if (accuracy > 80) {
      setFeedback('Excellent! Your writing is very accurate! 🌟');
    } else if (accuracy > 60) {
      setFeedback('Good job! Keep practicing to improve! 👍');
    } else {
      setFeedback('Try again! Follow the guide carefully 💪');
    }
  };

  const calculateAccuracy = (points: Point[]): number => {
    // This is a simplified accuracy calculation
    // In a real implementation, you would compare the drawn points
    // with the expected letter path points
    if (points.length < 10) return 0;

    // For now, return a random accuracy between 50-100
    return Math.floor(Math.random() * 50) + 50;
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, width, height);
    setPoints([]);
    setFeedback('');

    // Redraw guide image
    const img = new Image();
    img.src = letterImage;
    img.onload = () => {
      context.globalAlpha = 0.2;
      context.drawImage(img, 0, 0, width, height);
      context.globalAlpha = 1;
    };
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="border-2 border-gray-200 rounded-lg bg-white cursor-crosshair"
        />
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-12 left-0 right-0 text-center text-lg font-medium text-indigo-600"
          >
            {feedback}
          </motion.div>
        )}
      </div>
      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Clear Canvas
      </button>
    </div>
  );
}
