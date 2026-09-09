import { UserAttempt, ConfidenceRating } from '../types/assessment';
import { UserConceptState } from '../types/subject';
import { MasteryTier } from '../types/learner';

export interface BKTParameters {
  p_l0: number; // Initial mastery prior
  p_t: number;  // Probability of learning on practice
  p_s: number;  // Probability of slip (knows but errs)
  p_g: number;  // Probability of lucky guess
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  p_l0: 0.25,
  p_t: 0.18,
  p_s: 0.08,
  p_g: 0.15,
};

export function confidenceRatingToScalar(rating: ConfidenceRating): number {
  switch (rating) {
    case 'very_unsure': return 0.15;
    case 'unsure': return 0.35;
    case 'somewhat_confident': return 0.60;
    case 'confident': return 0.85;
    case 'very_confident': return 0.98;
    default: return 0.50;
  }
}

export function calculateBKTUpdate(
  currentMastery: number,
  isCorrect: boolean,
  confidenceScalar: number,
  responseTimeSecs: number,
  itemDifficulty: number,
  params = DEFAULT_BKT_PARAMS
): { newMastery: number; wasGuess: boolean; wasSlip: boolean } {
  // Adjust slip and guess based on confidence & response time
  let adjustedSlip = params.p_s;
  let adjustedGuess = params.p_g;

  if (confidenceScalar > 0.8) {
    adjustedGuess = 0.05; // Less likely to be a guess if user is very confident
  } else if (confidenceScalar < 0.3) {
    adjustedGuess = 0.40; // High probability of a guess if user is very unsure
  }

  // Fast response (< 4s) on high difficulty question with low confidence suggests guessing
  const wasGuess = isCorrect && confidenceScalar < 0.4 && responseTimeSecs < 5 && itemDifficulty > 0.6;
  const wasSlip = !isCorrect && currentMastery > 0.75 && confidenceScalar > 0.7 && responseTimeSecs < 6;

  let posteriorP: number;
  if (isCorrect) {
    const numerator = currentMastery * (1 - adjustedSlip);
    const denominator = currentMastery * (1 - adjustedSlip) + (1 - currentMastery) * adjustedGuess;
    posteriorP = denominator > 0 ? numerator / denominator : currentMastery;
  } else {
    const numerator = currentMastery * adjustedSlip;
    const denominator = currentMastery * adjustedSlip + (1 - currentMastery) * (1 - adjustedGuess);
    posteriorP = denominator > 0 ? numerator / denominator : currentMastery * 0.7;
  }

  // Project knowledge after instructional event
  const updatedMastery = posteriorP + (1 - posteriorP) * params.p_t;

  return {
    newMastery: Math.min(0.99, Math.max(0.05, updatedMastery)),
    wasGuess,
    wasSlip,
  };
}

export function determineMasteryTier(mastery: number): MasteryTier {
  if (mastery >= 0.93) return 'mastery';
  if (mastery >= 0.80) return 'advanced';
  if (mastery >= 0.60) return 'proficient';
  if (mastery >= 0.30) return 'developing';
  return 'novice';
}

export function computeContinuousDifficulty(
  currentDifficulty: number,
  recentAttempts: UserAttempt[]
): number {
  if (recentAttempts.length === 0) return 0.50;

  const last3 = recentAttempts.slice(-3);
  const correctRatio = last3.filter(a => a.isCorrect).length / last3.length;
  const avgResponseTime = last3.reduce((acc, a) => acc + a.responseTimeSeconds, 0) / last3.length;
  const avgConfidence = last3.reduce((acc, a) => acc + a.confidenceScalar, 0) / last3.length;

  let delta = 0;
  if (correctRatio === 1.0) {
    // 3 out of 3 correct
    if (avgResponseTime < 10 && avgConfidence > 0.75) {
      delta = +0.12; // Fast & confident -> rapid ramp-up
    } else {
      delta = +0.06; // Standard step up
    }
  } else if (correctRatio === 0.0) {
    // 0 out of 3 correct -> decrease complexity
    delta = -0.14;
  } else if (correctRatio < 0.5) {
    delta = -0.05;
  } else {
    delta = +0.02;
  }

  const nextDiff = Math.min(0.98, Math.max(0.12, currentDifficulty + delta));
  return Number(nextDiff.toFixed(2));
}

export function calculateCalibrationScore(attempts: UserAttempt[]): {
  calibrationScore: number; // 0 - 100%
  overconfidenceTendency: number; // 0 - 100%
  underconfidenceTendency: number; // 0 - 100%
} {
  if (attempts.length === 0) {
    return { calibrationScore: 85, overconfidenceTendency: 10, underconfidenceTendency: 10 };
  }

  let totalSquaredError = 0;
  let overconfidentCount = 0;
  let underconfidentCount = 0;

  attempts.forEach(attempt => {
    const outcome = attempt.isCorrect ? 1.0 : 0.0;
    const confidence = attempt.confidenceScalar;
    totalSquaredError += Math.pow(confidence - outcome, 2);

    if (confidence > 0.75 && !attempt.isCorrect) {
      overconfidentCount++;
    }
    if (confidence < 0.40 && attempt.isCorrect) {
      underconfidentCount++;
    }
  });

  const brierScore = totalSquaredError / attempts.length; // 0.0 is perfect, 1.0 is worst
  const calibrationScore = Math.max(10, Math.min(100, Math.round((1 - brierScore) * 100)));
  const overconfidenceTendency = Math.round((overconfidentCount / attempts.length) * 100);
  const underconfidenceTendency = Math.round((underconfidentCount / attempts.length) * 100);

  return { calibrationScore, overconfidenceTendency, underconfidenceTendency };
}

export function calculateEpistemicHealth(userConceptStates: Record<string, UserConceptState>): {
  masteryAvg: number;
  retentionAvg: number;
  prerequisiteGapsCount: number;
  decayingConceptsCount: number;
  masteredCount: number;
} {
  const states = Object.values(userConceptStates);
  if (states.length === 0) {
    return { masteryAvg: 0.5, retentionAvg: 0.8, prerequisiteGapsCount: 0, decayingConceptsCount: 0, masteredCount: 0 };
  }

  const masterySum = states.reduce((sum, s) => sum + s.masteryScore, 0);
  const retentionSum = states.reduce((sum, s) => sum + s.retentionScore, 0);
  const gaps = states.filter(s => s.isPrerequisiteBottleneck || (s.masteryScore < 0.45 && s.totalAttempts > 0)).length;
  const decaying = states.filter(s => s.retentionScore < 0.65).length;
  const mastered = states.filter(s => s.masteryTier === 'mastery' || s.masteryTier === 'advanced').length;

  return {
    masteryAvg: masterySum / states.length,
    retentionAvg: retentionSum / states.length,
    prerequisiteGapsCount: gaps,
    decayingConceptsCount: decaying,
    masteredCount: mastered,
  };
}
