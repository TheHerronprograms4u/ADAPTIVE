export interface MasteryHistoryPoint {
  date: string;
  timestamp: number;
  overallMastery: number; // 0 - 100%
  retentionAverage: number; // 0 - 100%
  algebraScore?: number;
  calculusScore?: number;
  geometryScore?: number;
}

export interface ForgettingCurvePoint {
  daysPassed: number;
  unreviewedRetention: number; // e.g. exponential decay e^(-t/S)
  spacedRepetitionRetention: number; // stepped boosted curve
}

export interface CalibrationBucket {
  confidenceBucket: string; // "10%", "30%", "60%", "85%", "100%"
  meanConfidence: number;
  observedAccuracy: number;
  sampleCount: number;
}

export interface StudyConsistencyDay {
  date: string;
  dayOfWeek: number; // 0-6
  minutesSpent: number;
  intensityScore: number; // 0 to 4
}

export interface VelocityMetric {
  conceptId: string;
  conceptName: string;
  daysToMastery: number;
  attemptsRequired: number;
  difficulty: number;
  retentionDecayRate: number;
}
