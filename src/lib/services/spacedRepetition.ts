interface ReviewItem {
  id: string;
  type: 'letter' | 'pattern' | 'word';
  content: string;
  level: number;
  lastReviewed: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  consecutiveCorrect: number;
}

class SpacedRepetitionSystem {
  private static readonly MIN_INTERVAL = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  private static readonly MAX_INTERVAL = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly INITIAL_EASE_FACTOR = 2.5;

  calculateNextReview(
    item: ReviewItem,
    quality: number // 0-5, where 5 is perfect recall
  ): ReviewItem {
    let { interval, easeFactor, consecutiveCorrect } = item;
    
    // Update ease factor based on performance
    easeFactor = Math.max(
      SpacedRepetitionSystem.MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate new interval
    if (quality < 3) {
      // If recall was difficult, reset progress
      interval = SpacedRepetitionSystem.MIN_INTERVAL;
      consecutiveCorrect = 0;
    } else {
      consecutiveCorrect++;
      if (interval === 0) {
        interval = SpacedRepetitionSystem.MIN_INTERVAL;
      } else {
        interval = Math.min(
          interval * easeFactor,
          SpacedRepetitionSystem.MAX_INTERVAL
        );
      }
    }

    const now = Date.now();
    return {
      ...item,
      lastReviewed: now,
      nextReview: now + interval,
      interval,
      easeFactor,
      consecutiveCorrect,
    };
  }

  getDueItems(items: ReviewItem[]): ReviewItem[] {
    const now = Date.now();
    return items
      .filter((item) => item.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);
  }

  getReviewStatus(item: ReviewItem): {
    daysUntilReview: number;
    status: 'due' | 'upcoming' | 'learned';
    progress: number;
  } {
    const now = Date.now();
    const daysUntilReview = Math.max(
      0,
      Math.ceil((item.nextReview - now) / (24 * 60 * 60 * 1000))
    );

    let status: 'due' | 'upcoming' | 'learned';
    if (item.nextReview <= now) {
      status = 'due';
    } else if (item.consecutiveCorrect >= 5) {
      status = 'learned';
    } else {
      status = 'upcoming';
    }

    // Calculate progress based on consecutive correct answers
    const progress = Math.min((item.consecutiveCorrect / 5) * 100, 100);

    return {
      daysUntilReview,
      status,
      progress,
    };
  }

  generateInitialReviewItem(
    id: string,
    type: 'letter' | 'pattern' | 'word',
    content: string,
    level: number
  ): ReviewItem {
    return {
      id,
      type,
      content,
      level,
      lastReviewed: 0,
      nextReview: Date.now(),
      interval: 0,
      easeFactor: SpacedRepetitionSystem.INITIAL_EASE_FACTOR,
      consecutiveCorrect: 0,
    };
  }
}

export const spacedRepetition = new SpacedRepetitionSystem();
