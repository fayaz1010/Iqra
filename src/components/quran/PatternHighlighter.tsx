'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { patternMatcher } from '@/lib/services/patternMatcher';

interface PatternHighlighterProps {
  text: string;
  userLevel: number;
  onPatternClick?: (patternId: string) => void;
}

export default function PatternHighlighter({
  text,
  userLevel,
  onPatternClick,
}: PatternHighlighterProps) {
  const [highlightedText, setHighlightedText] = useState<
    Array<{ text: string; patternId?: string }>
  >([]);

  useEffect(() => {
    const results = patternMatcher.findPatternsInText(text, userLevel);
    
    // Sort matches by position to properly split text
    const allMatches = results.flatMap((result) =>
      result.matches.map((match) => ({
        ...match,
        patternId: result.pattern.id,
      }))
    ).sort((a, b) => a.position - b.position);

    // Split text into segments with pattern information
    const segments: Array<{ text: string; patternId?: string }> = [];
    let lastIndex = 0;

    allMatches.forEach((match) => {
      if (match.position > lastIndex) {
        // Add non-matching text before pattern
        segments.push({
          text: text.slice(lastIndex, match.position),
        });
      }
      // Add matching pattern
      segments.push({
        text: match.text,
        patternId: match.patternId,
      });
      lastIndex = match.position + match.text.length;
    });

    // Add remaining text after last match
    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
      });
    }

    setHighlightedText(segments);
  }, [text, userLevel]);

  return (
    <div className="relative font-arabic text-2xl leading-loose text-right" dir="rtl">
      {highlightedText.map((segment, index) => (
        <motion.span
          key={index}
          className={`relative inline-block ${
            segment.patternId
              ? 'cursor-pointer text-indigo-600 hover:text-indigo-800'
              : ''
          }`}
          whileHover={segment.patternId ? { scale: 1.1 } : {}}
          onClick={() => {
            if (segment.patternId && onPatternClick) {
              onPatternClick(segment.patternId);
            }
          }}
        >
          {segment.text}
          {segment.patternId && (
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.span>
      ))}
    </div>
  );
}
