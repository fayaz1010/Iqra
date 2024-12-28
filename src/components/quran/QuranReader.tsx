import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookStore } from '@/lib/store/useBookStore';

interface Verse {
  number: number;
  text: string;
  translation: string;
  audioUrl: string;
  transliteration: string;
  words: {
    text: string;
    transliteration: string;
    translation: string;
    audioTimestamp: number;
  }[];
}

interface Chapter {
  id: number;
  name: string;
  englishName: string;
  numberOfVerses: number;
  verses: Verse[];
}

export default function QuranReader() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number>(0);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [matchingPatterns, setMatchingPatterns] = useState<string[]>([]);

  const { bookProgress } = useBookStore();

  // Function to find patterns from Iqra books in Quran text
  const findMatchingPatterns = (text: string) => {
    // Implementation will search for patterns learned in Iqra books
    // This is a placeholder - actual implementation will depend on your pattern database
    return ['Pattern 1', 'Pattern 2'];
  };

  const handleWordClick = (word: any) => {
    setSelectedWord(word);
    setShowWordDetails(true);
    setMatchingPatterns(findMatchingPatterns(word.text));
  };

  const playAudio = (verse: Verse) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }

    const audio = new Audio(verse.audioUrl);
    setAudioPlayer(audio);
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (currentVerse < (selectedChapter?.verses.length || 0) - 1) {
        setCurrentVerse(prev => prev + 1);
        playAudio(selectedChapter!.verses[currentVerse + 1]);
      }
    });

    audio.play();
    setIsPlaying(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Chapter Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Select Surah</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Chapter selection cards will be rendered here */}
        </div>
      </motion.div>

      {/* Quran Reader */}
      {selectedChapter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedChapter.name} - {selectedChapter.englishName}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => playAudio(selectedChapter.verses[currentVerse])}
                className={`p-3 rounded-full ${
                  isPlaying
                    ? 'bg-red-100 text-red-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {selectedChapter.verses.map((verse, index) => (
              <motion.div
                key={verse.number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 rounded-lg ${
                  currentVerse === index
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex flex-wrap gap-4 mb-4 text-2xl" dir="rtl">
                  {verse.words.map((word, wordIndex) => (
                    <motion.button
                      key={wordIndex}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordClick(word)}
                      className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      {word.text}
                    </motion.button>
                  ))}
                </div>

                <div className="text-gray-600 mb-2">{verse.transliteration}</div>
                <div className="text-gray-700">{verse.translation}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Word Details Modal */}
      <AnimatePresence>
        {showWordDetails && selectedWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowWordDetails(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">{selectedWord.text}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Transliteration</h4>
                  <p>{selectedWord.transliteration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Translation</h4>
                  <p>{selectedWord.translation}</p>
                </div>
                {matchingPatterns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Matching Patterns from Iqra
                    </h4>
                    <ul className="list-disc list-inside">
                      {matchingPatterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setShowWordDetails(false)}
                  className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
