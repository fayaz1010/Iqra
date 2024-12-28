'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementStore } from '@/lib/store/useAchievementStore';

interface PronunciationPracticeProps {
  letter: {
    id: string;
    name: string;
    arabicText: string;
    audioUrl: string;
    examples: Array<{
      text: string;
      audioUrl: string;
    }>;
  };
  onComplete?: (accuracy: number) => void;
}

export default function PronunciationPractice({
  letter,
  onComplete,
}: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { checkAchievements } = useAchievementStore();

  useEffect(() => {
    // Request microphone permissions
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
          setPlaybackUrl(URL.createObjectURL(audioBlob));
          audioChunks.current = [];
        };
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    return () => {
      if (playbackUrl) {
        URL.revokeObjectURL(playbackUrl);
      }
    };
  }, []);

  const startRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setShowFeedback(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setAttempts((prev) => prev + 1);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // In a real implementation, you would send the audio to a server
      // for pronunciation analysis. Here we'll simulate feedback.
      const simulatedAccuracy = Math.random() * 40 + 60; // 60-100%
      if (onComplete) {
        onComplete(simulatedAccuracy);
      }

      checkAchievements({
        pronunciationAttempts: attempts + 1,
        pronunciationAccuracy: simulatedAccuracy,
      });

      setShowFeedback(true);
    }
  };

  const playReferenceAudio = () => {
    const audio = new Audio(letter.audioUrl);
    audio.play();
  };

  const playExampleAudio = () => {
    const audio = new Audio(letter.examples[currentExample].audioUrl);
    audio.play();
  };

  const nextExample = () => {
    if (currentExample < letter.examples.length - 1) {
      setCurrentExample((prev) => prev + 1);
    }
  };

  const prevExample = () => {
    if (currentExample > 0) {
      setCurrentExample((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {/* Letter Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-arabic mb-4">{letter.arabicText}</div>
          <h2 className="text-2xl font-bold text-gray-900">{letter.name}</h2>
        </div>

        {/* Audio Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={playReferenceAudio}
            className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Listen to Reference
          </button>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 ${
              isRecording
                ? 'bg-red-500 text-white'
                : 'bg-indigo-600 text-white'
            } rounded-lg hover:opacity-90 transition-colors`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="text-2xl font-mono text-indigo-600">
              {Math.floor(recordingTime / 60)}:
              {(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          </motion.div>
        )}

        {/* Playback */}
        {playbackUrl && !isRecording && (
          <div className="mb-8">
            <audio
              src={playbackUrl}
              controls
              className="w-full"
            />
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-900 mb-2">Feedback:</h3>
                <ul className="list-disc list-inside text-indigo-700 space-y-1">
                  <li>Pay attention to the length of the sound</li>
                  <li>Focus on clear pronunciation</li>
                  <li>Try to match the reference audio&apos;s tone</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Practice Examples</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevExample}
                disabled={currentExample === 0}
                className="p-2 text-indigo-600 disabled:text-gray-400"
              >
                ←
              </button>
              <div className="text-center">
                <div className="text-3xl font-arabic mb-2">
                  {letter.examples[currentExample].text}
                </div>
                <button
                  onClick={playExampleAudio}
                  className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  Play Example
                </button>
              </div>
              <button
                onClick={nextExample}
                disabled={currentExample === letter.examples.length - 1}
                className="p-2 text-indigo-600 disabled:text-gray-400"
              >
                →
              </button>
            </div>
            <div className="text-center text-sm text-gray-600">
              Example {currentExample + 1} of {letter.examples.length}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
