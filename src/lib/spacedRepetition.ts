import { UserConceptState } from '../types/subject';

export interface SpacedReviewResult {
  updatedStability: number;
  updatedDifficulty: number;
  nextReviewDate: string;
  recommendedIntervalDays: number;
  newRetentionScore: number;
}

/**
 * Calculates current retention probability R based on elapsed time and stability (days).
 * Uses exponential half-life decay: R(t) = exp(- ln(2) * (t / S))
 */
export function calculateCurrentRetention(
  lastReviewedIso: string,
  stabilityDays: number
): number {
  if (!lastReviewedIso || stabilityDays <= 0) return 0.50;

  const now = Date.now();
  const lastTime = new Date(lastReviewedIso).getTime();
  const elapsedDays = Math.max(0, (now - lastTime) / (1000 * 60 * 60 * 24));

  // Memory half-life decay
  const decayExponent = (-0.693147 * elapsedDays) / Math.max(0.5, stabilityDays);
  const retention = Math.exp(decayExponent);

  return Math.max(0.05, Math.min(1.0, retention));
}

/**
 * Updates FSRS memory stability and difficulty after an active retrieval event.
 */
export function processSpacedRepetitionReview(
  currentState: UserConceptState,
  isCorrect: boolean,
  confidenceScalar: number // 0.1 to 1.0
): SpacedReviewResult {
  const currentStability = currentState.stabilityDays || 1.5;
  const currentDiff = currentState.difficultyRating || 0.5;

  let newStability: number;
  let newDifficulty: number;

  if (isCorrect) {
    // Correct retrieval expands memory stability exponentially
    const confidenceBoost = 1.0 + (confidenceScalar - 0.5) * 0.6; // 0.7x to 1.3x
    const difficultyDampener = (1.1 - currentDiff);
    const growthFactor = 1.8 * difficultyDampener * confidenceBoost;
    
    newStability = Math.min(180, Math.max(1.0, currentStability * growthFactor));
    // Item gets slightly easier on clean recall
    newDifficulty = Math.max(0.1, currentDiff - 0.03 * confidenceScalar);
  } else {
    // Lapse / memory breakdown resets stability towards baseline
    newStability = Math.max(0.5, currentStability * 0.35);
    // Item difficulty increases
    newDifficulty = Math.min(0.95, currentDiff + 0.08);
  }

  // Calculate target interval based on target 90% retention threshold
  // R = 0.90 => t = -S * ln(0.90) / ln(2) ~= S * 0.152
  const intervalDays = Math.max(1, Math.round(newStability * 0.95));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    updatedStability: Number(newStability.toFixed(2)),
    updatedDifficulty: Number(newDifficulty.toFixed(2)),
    nextReviewDate: nextDate.toISOString(),
    recommendedIntervalDays: intervalDays,
    newRetentionScore: 1.0, // Instantly refreshed upon successful active review
  };
}

/**
 * Generates theoretical forgetting curve points for visual plotting in analytics.
 */
export function generateForgettingCurveData(
  stabilityDays: number
): { day: number; noReviewRetention: number; spacedReviewRetention: number }[] {
  const data = [];
  const S = Math.max(1.5, stabilityDays);

  for (let day = 0; day <= 30; day += 2) {
    // Standard unreviewed curve: decays rapidly
    const decay = Math.exp((-0.693147 * day) / S);
    const noReview = Math.round(decay * 100);

    // Spaced curve with refresh at Day 3 and Day 10
    let spaced = decay;
    if (day >= 3 && day < 10) {
      const postDay3 = day - 3;
      spaced = Math.exp((-0.693147 * postDay3) / (S * 2.5));
    } else if (day >= 10) {
      const postDay10 = day - 10;
      spaced = Math.exp((-0.693147 * postDay10) / (S * 6.0));
    }
    const spacedPct = Math.min(100, Math.round(spaced * 100));

    data.push({
      day,
      noReviewRetention: Math.max(5, noReview),
      spacedReviewRetention: Math.max(25, spacedPct),
    });
  }

  return data;
}

/**
 * Returns human-friendly spaced review urgency tag and styling
 */
export function getReviewUrgency(retentionScore: number): {
  label: string;
  badgeColor: string;
  priority: 'critical' | 'high' | 'medium' | 'optimal';
} {
  if (retentionScore < 0.40) {
    return { label: 'Review Immediately (Memory Fading)', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', priority: 'critical' };
  }
  if (retentionScore < 0.65) {
    return { label: 'Review Today (High Priority)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', priority: 'high' };
  }
  if (retentionScore < 0.85) {
    return { label: 'Review Soon (Within 3 Days)', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', priority: 'medium' };
  }
  return { label: 'Strong Memory (Stable)', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', priority: 'optimal' };
}
