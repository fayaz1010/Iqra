interface Pattern {
  id: string;
  name: string;
  arabicText: string;
  description: string;
  level: number;
  examples: string[];
}

interface MatchResult {
  pattern: Pattern;
  matches: {
    text: string;
    position: number;
    context: string;
  }[];
}

class PatternMatcher {
  private patterns: Pattern[] = [
    {
      id: 'fatha',
      name: 'Fatha',
      arabicText: 'َ',
      description: 'Short vowel mark for "a" sound',
      level: 1,
      examples: ['بَ', 'تَ', 'ثَ'],
    },
    {
      id: 'kasra',
      name: 'Kasra',
      arabicText: 'ِ',
      description: 'Short vowel mark for "i" sound',
      level: 1,
      examples: ['بِ', 'تِ', 'ثِ'],
    },
    {
      id: 'damma',
      name: 'Damma',
      arabicText: 'ُ',
      description: 'Short vowel mark for "u" sound',
      level: 1,
      examples: ['بُ', 'تُ', 'ثُ'],
    },
    // Add more patterns based on Iqra curriculum
  ];

  findPatternsInText(text: string, userLevel: number): MatchResult[] {
    const results: MatchResult[] = [];

    this.patterns
      .filter((pattern) => pattern.level <= userLevel)
      .forEach((pattern) => {
        const matches = this.findMatches(text, pattern.arabicText);
        if (matches.length > 0) {
          results.push({
            pattern,
            matches,
          });
        }
      });

    return results;
  }

  private findMatches(text: string, pattern: string) {
    const matches: { text: string; position: number; context: string }[] = [];
    let position = text.indexOf(pattern);

    while (position !== -1) {
      // Get context (surrounding text)
      const start = Math.max(0, position - 10);
      const end = Math.min(text.length, position + pattern.length + 10);
      const context = text.slice(start, end);

      matches.push({
        text: pattern,
        position,
        context,
      });

      position = text.indexOf(pattern, position + 1);
    }

    return matches;
  }

  getPatternsByLevel(level: number): Pattern[] {
    return this.patterns.filter((pattern) => pattern.level <= level);
  }

  getPatternById(id: string): Pattern | undefined {
    return this.patterns.find((pattern) => pattern.id === id);
  }

  // Get related patterns that often appear together
  getRelatedPatterns(patternId: string): Pattern[] {
    const pattern = this.getPatternById(patternId);
    if (!pattern) return [];

    return this.patterns.filter(
      (p) => p.level === pattern.level && p.id !== patternId
    );
  }

  // Get practice examples for a specific pattern
  getPracticeExamples(patternId: string): string[] {
    const pattern = this.getPatternById(patternId);
    return pattern ? pattern.examples : [];
  }
}

export const patternMatcher = new PatternMatcher();
