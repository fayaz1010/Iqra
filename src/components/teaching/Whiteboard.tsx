'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  Square2StackIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  PhotoIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface WhiteboardProps {
  sessionId: string;
  isTeacher: boolean;
  onSave?: (data: string) => void;
  initialData?: string;
}

const TOOLS: Tool[] = [
  { id: 'cursor', name: 'Cursor', icon: <CursorArrowRaysIcon className="w-6 h-6" /> },
  { id: 'pen', name: 'Pen', icon: <PencilIcon className="w-6 h-6" /> },
  { id: 'rectangle', name: 'Rectangle', icon: <Square2StackIcon className="w-6 h-6" /> },
  { id: 'image', name: 'Image', icon: <PhotoIcon className="w-6 h-6" /> },
  { id: 'text', name: 'Text', icon: <DocumentTextIcon className="w-6 h-6" /> },
  { id: 'hand', name: 'Hand', icon: <HandRaisedIcon className="w-6 h-6" /> },
];

const COLORS = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

export default function Whiteboard({
  sessionId,
  isTeacher,
  onSave,
  initialData,
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to parent size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      // Set up context
      const context = canvas.getContext('2d');
      if (!context) return;

      context.lineCap = 'round';
      context.strokeStyle = selectedColor;
      context.lineWidth = lineWidth;
      contextRef.current = context;

      // Load initial data if provided
      if (initialData) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        img.src = initialData;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [initialData]);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = selectedColor;
    contextRef.current.lineWidth = lineWidth;
  }, [selectedColor, lineWidth]);

  const saveCanvasState = () => {
    if (!canvasRef.current || !contextRef.current) return;
    const imageData = contextRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setUndoStack((prev) => [...prev, imageData]);
    setRedoStack([]);
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !isTeacher) return;

    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !isTeacher) return;

    const { offsetX, offsetY } = event.nativeEvent;

    switch (selectedTool) {
      case 'pen':
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        break;
      case 'rectangle':
        // Implementation for rectangle tool
        break;
      // Add more tool implementations
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current || !isTeacher) return;

    contextRef.current.closePath();
    setIsDrawing(false);
    saveCanvasState();
  };

  const undo = () => {
    if (undoStack.length === 0 || !contextRef.current || !canvasRef.current)
      return;

    const lastState = undoStack[undoStack.length - 1];
    const currentState = contextRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, -1));
    contextRef.current.putImageData(lastState, 0, 0);
  };

  const redo = () => {
    if (redoStack.length === 0 || !contextRef.current || !canvasRef.current)
      return;

    const nextState = redoStack[redoStack.length - 1];
    const currentState = contextRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack((prev) => prev.slice(0, -1));
    contextRef.current.putImageData(nextState, 0, 0);
  };

  const clear = () => {
    if (!contextRef.current || !canvasRef.current) return;

    saveCanvasState();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const handleSave = () => {
    if (!canvasRef.current || !onSave) return;
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !contextRef.current || !canvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        saveCanvasState();
        contextRef.current?.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-20 bg-white border-r p-2 flex flex-col space-y-4">
        {/* Tools */}
        <div className="space-y-2">
          {TOOLS.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                selectedTool === tool.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!isTeacher}
            >
              {tool.icon}
            </motion.button>
          ))}
        </div>

        {/* Colors */}
        <div className="space-y-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-full aspect-square rounded-lg border-2 ${
                selectedColor === color ? 'border-gray-900' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              disabled={!isTeacher}
            />
          ))}
        </div>

        {/* Line Width */}
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-full"
          disabled={!isTeacher}
        />

        {/* Actions */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={undo}
            disabled={undoStack.length === 0 || !isTeacher}
            className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <ArrowUturnLeftIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={redo}
            disabled={redoStack.length === 0 || !isTeacher}
            className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <ArrowUturnRightIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clear}
            disabled={!isTeacher}
            className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <TrashIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            disabled={!isTeacher}
            className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <PhotoIcon className="w-6 h-6" />
          </motion.button>
          <motion.label
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={!isTeacher}
            />
            <DocumentTextIcon className="w-6 h-6" />
          </motion.label>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-gray-50">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 cursor-crosshair"
        />
      </div>
    </div>
  );
}
