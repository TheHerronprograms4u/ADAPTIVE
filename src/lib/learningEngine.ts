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

export function evaluatePreliminaryExam(
  attempts: import('../types/preliminaryExam').PreliminaryExamAttempt[]
): import('../types/preliminaryExam').PreliminaryExamResult {
  const probeScores: Record<import('../types/preliminaryExam').CognitiveProbeType, {
    isCorrect: boolean;
    confidenceScalar: number;
    responseTimeSeconds: number;
    weight: number;
  }> = {
    visual_spatial: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
    deductive_socratic: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
    procedural_practice: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
    conceptual_analogy: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
    formal_reading: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
    metacognitive_calibration: { isCorrect: false, confidenceScalar: 0.5, responseTimeSeconds: 10, weight: 0.7 },
  };

  let totalBrierSquared = 0;
  let overconfidentCount = 0;
  let underconfidentCount = 0;
  let correctCount = 0;
  let totalLatency = 0;

  attempts.forEach(att => {
    const isCorr = att.isCorrect;
    if (isCorr) correctCount++;
    totalLatency += att.responseTimeSeconds;

    const outcome = isCorr ? 1.0 : 0.0;
    totalBrierSquared += Math.pow(att.confidenceScalar - outcome, 2);

    if (att.confidenceScalar > 0.75 && !isCorr) overconfidentCount++;
    if (att.confidenceScalar < 0.40 && isCorr) underconfidentCount++;

    // Calculate modality weight from empirical probe
    // Speed factor: 1.0 for <= 6s, decaying to 0.4 for >= 25s
    const speedFactor = Math.max(0.35, Math.min(1.0, 12 / Math.max(4, att.responseTimeSeconds)));
    const accuracyFactor = isCorr ? 1.0 : 0.25;
    const confidenceFactor = att.confidenceScalar;

    const calculatedWeight = Math.min(0.98, Math.max(0.20,
      0.45 * accuracyFactor + 0.35 * confidenceFactor + 0.20 * speedFactor
    ));

    if (probeScores[att.probeType]) {
      probeScores[att.probeType] = {
        isCorrect: isCorr,
        confidenceScalar: att.confidenceScalar,
        responseTimeSeconds: att.responseTimeSeconds,
        weight: Number(calculatedWeight.toFixed(2)),
      };
    }
  });

  const totalProbes = Math.max(1, attempts.length);
  const accuracyRate = correctCount / totalProbes;
  const avgLatency = totalLatency / totalProbes;
  const brierScore = Number((totalBrierSquared / totalProbes).toFixed(3));

  // Determine modalities
  const visual = probeScores.visual_spatial.weight;
  const socratic = probeScores.deductive_socratic.weight;
  const practice = probeScores.procedural_practice.weight;
  const analogies = probeScores.conceptual_analogy.weight;
  const reading = probeScores.formal_reading.weight;
  const directExplanation = Number(((reading * 0.6 + socratic * 0.4)).toFixed(2));
  const interactive = Number(((visual * 0.4 + practice * 0.4 + socratic * 0.2)).toFixed(2));

  const modalityWeights: import('../types/learner').ModalityWeights = {
    visual,
    reading,
    practice,
    interactive,
    socratic,
    directExplanation,
    analogies,
  };

  // Epistemic Confidence Bias
  let epistemicConfidenceBias: 'calibrated' | 'overconfident' | 'underconfident' = 'calibrated';
  if (overconfidentCount >= 2 && overconfidentCount > underconfidentCount) {
    epistemicConfidenceBias = 'overconfident';
  } else if (underconfidentCount >= 2 && underconfidentCount > overconfidentCount) {
    epistemicConfidenceBias = 'underconfident';
  }

  // Speed-Accuracy Tradeoff
  let speedAccuracyTradeoff: 'rapid_intuitive' | 'deliberate_rigorous' | 'balanced' = 'balanced';
  if (avgLatency < 9 && accuracyRate >= 0.65) {
    speedAccuracyTradeoff = 'rapid_intuitive';
  } else if (avgLatency > 15) {
    speedAccuracyTradeoff = 'deliberate_rigorous';
  }

  // Modality ranking
  type ModalityDomain = 'visual' | 'socratic' | 'practice' | 'analogies' | 'reading' | 'interactive';
  const modalityList = ([
    { name: 'visual', score: visual },
    { name: 'socratic', score: socratic },
    { name: 'practice', score: practice },
    { name: 'analogies', score: analogies },
    { name: 'reading', score: reading },
  ] as { name: ModalityDomain; score: number }[]).sort((a, b) => b.score - a.score);

  const topPrimary: ModalityDomain = modalityList[0].name;
  const topSecondary: ModalityDomain = modalityList[1].name;

  let personaName = 'Adaptive Multi-Modal Learner';
  let personaTagline = 'Balanced multi-modal cognitive spectrum that dynamically pivots across learning modes.';
  let defaultTutorMode: import('../types/tutor').TutorMode = 'explain';
  let pedagogyDirective = 'Provide structured conceptual overviews with dynamic interactive scaffolding.';

  if (topPrimary === 'visual') {
    personaName = 'Visual-Intuitive Explorer';
    personaTagline = 'Synthesizes knowledge fastest through spatial geometry, diagrams, coordinate manifolds, and structural graphs.';
    defaultTutorMode = 'analogy';
    pedagogyDirective = 'Anchor all theoretical explanations in geometric diagrams, spatial charts, and intuitive structural analogies.';
  } else if (topPrimary === 'socratic') {
    personaName = 'Socratic-Deductive Inquirer';
    personaTagline = 'Excels when guided to deduce first principles and invariant constraints through step-by-step inquiry.';
    defaultTutorMode = 'socratic';
    pedagogyDirective = 'Guide with targeted deductive questions. Prompt the learner to isolate constraints and derive theorems step by step.';
  } else if (topPrimary === 'practice') {
    personaName = 'Systematic Problem Practitioner';
    personaTagline = 'Flourishes through immediate procedural execution, calculation drills, and active scaffolding.';
    defaultTutorMode = 'example';
    pedagogyDirective = 'Emphasize step-by-step worked examples followed immediately by progressive problem-solving challenges.';
  } else if (topPrimary === 'analogies') {
    personaName = 'Metaphorical Systems Synthesizer';
    personaTagline = 'Transfers conceptual models and physical isomorphisms across adjacent scientific and mathematical domains.';
    defaultTutorMode = 'analogy';
    pedagogyDirective = 'Bridge abstract symbols with vivid physical metaphors and real-world isomorphism models.';
  } else if (topPrimary === 'reading') {
    personaName = 'Formal-Axiomatic Rigorist';
    personaTagline = 'Demands exact mathematical definitions, rigorous proofs, and careful boundary condition verification.';
    defaultTutorMode = 'deep_dive';
    pedagogyDirective = 'Provide formal axiomatic proofs, explicit boundary domain restrictions, and mathematical derivations.';
  }

  // Scaffolding Level
  let scaffoldingLevel: 'high' | 'moderate' | 'minimal' = 'moderate';
  if (accuracyRate <= 0.40 || brierScore > 0.35) {
    scaffoldingLevel = 'high';
  } else if (accuracyRate >= 0.80 && brierScore < 0.20) {
    scaffoldingLevel = 'minimal';
  }

  // IRT Ability estimation theta (-2.5 to +2.5)
  const baseAbilityTheta = Number(((accuracyRate - 0.5) * 4.0 + (1 - brierScore) * 0.5).toFixed(2));
  const calibratedDifficulty = Number(Math.max(0.20, Math.min(0.90, 0.30 + accuracyRate * 0.5)).toFixed(2));

  const empiricalTeachingStyle: import('../types/learner').EmpiricalTeachingStyle = {
    personaName,
    personaTagline,
    primaryModality: topPrimary as any,
    secondaryModality: topSecondary as any,
    pedagogyDirective,
    defaultTutorMode: defaultTutorMode as any,
    scaffoldingLevel,
    brierScore,
    epistemicConfidenceBias,
    speedAccuracyTradeoff,
    assessedAt: new Date().toISOString(),
  };

  const summaryNarrative = `Preliminary Diagnostic complete. Empirically determined **${personaName}** cognitive profile (${Math.round(accuracyRate * 100)}% accuracy, ${avgLatency.toFixed(1)}s avg latency, Brier Calibration: ${Math.round((1 - brierScore) * 100)}%). Calibrated initial difficulty to ${(calibratedDifficulty * 100).toFixed(0)}%.`;

  const recommendedPedagogyAction = `AI Socratic Tutor and Learning Runner initialized with **${personaName}** tuning (${defaultTutorMode.toUpperCase()} mode as primary default).`;

  return {
    empiricalTeachingStyle,
    modalityWeights,
    baseAbilityTheta,
    calibratedDifficulty,
    probeScores,
    summaryNarrative,
    recommendedPedagogyAction,
  };
}

