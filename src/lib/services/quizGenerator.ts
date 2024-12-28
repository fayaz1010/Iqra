interface QuizQuestion {
  id: string;
  type: 'multipleChoice' | 'matching' | 'writing' | 'audio';
  question: string;
  correctAnswer: string;
  options?: string[];
  audioUrl?: string;
  imageUrl?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface QuizConfig {
  totalQuestions: number;
  types: ('multipleChoice' | 'matching' | 'writing' | 'audio')[];
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
}

class QuizGenerator {
  generateQuiz(userLevel: number, config: QuizConfig): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    // Generate questions based on user level and configuration
    for (let i = 0; i < config.totalQuestions; i++) {
      const type = config.types[Math.floor(Math.random() * config.types.length)];
      questions.push(this.generateQuestion(type, userLevel, config.difficulty));
    }

    return questions;
  }

  private generateQuestion(
    type: 'multipleChoice' | 'matching' | 'writing' | 'audio',
    level: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    switch (type) {
      case 'multipleChoice':
        return this.generateMultipleChoiceQuestion(level, difficulty);
      case 'matching':
        return this.generateMatchingQuestion(level, difficulty);
      case 'writing':
        return this.generateWritingQuestion(level, difficulty);
      case 'audio':
        return this.generateAudioQuestion(level, difficulty);
      default:
        throw new Error(`Unsupported question type: ${type}`);
    }
  }

  private generateMultipleChoiceQuestion(
    level: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    // Example question generation for letter recognition
    const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر'];
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    
    // Generate wrong options
    const wrongOptions = letters
      .filter((l) => l !== correctLetter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return {
      id: `mc-${Date.now()}`,
      type: 'multipleChoice',
      question: 'Which letter is this?',
      correctAnswer: correctLetter,
      options: [...wrongOptions, correctLetter].sort(() => Math.random() - 0.5),
      imageUrl: `/letters/${correctLetter}.png`,
      difficulty,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    };
  }

  private generateMatchingQuestion(
    level: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    // Example matching question for letter sounds
    const pairs = [
      { letter: 'ا', sound: 'alif' },
      { letter: 'ب', sound: 'ba' },
      { letter: 'ت', sound: 'ta' },
    ];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    return {
      id: `match-${Date.now()}`,
      type: 'matching',
      question: 'Match the letter with its correct sound:',
      correctAnswer: pair.sound,
      options: pairs.map((p) => p.sound).sort(() => Math.random() - 0.5),
      imageUrl: `/letters/${pair.letter}.png`,
      difficulty,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35,
    };
  }

  private generateWritingQuestion(
    level: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    // Example writing question
    const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر'];
    const letter = letters[Math.floor(Math.random() * letters.length)];

    return {
      id: `write-${Date.now()}`,
      type: 'writing',
      question: 'Write this letter:',
      correctAnswer: letter,
      imageUrl: `/letters/${letter}.png`,
      difficulty,
      points: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40,
    };
  }

  private generateAudioQuestion(
    level: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    // Example audio question for letter pronunciation
    const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر'];
    const letter = letters[Math.floor(Math.random() * letters.length)];

    return {
      id: `audio-${Date.now()}`,
      type: 'audio',
      question: 'Listen and select the correct letter:',
      correctAnswer: letter,
      options: [...letters.filter((l) => l !== letter).slice(0, 3), letter].sort(
        () => Math.random() - 0.5
      ),
      audioUrl: `/audio/letters/${letter}.mp3`,
      difficulty,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35,
    };
  }

  calculateScore(questions: QuizQuestion[], answers: Record<string, string>): {
    score: number;
    totalPossible: number;
    correctAnswers: number;
    incorrectAnswers: number;
  } {
    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const totalPossible = questions.reduce((sum, q) => sum + q.points, 0);

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score += question.points;
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    return {
      score,
      totalPossible,
      correctAnswers,
      incorrectAnswers,
    };
  }
}

export const quizGenerator = new QuizGenerator();
