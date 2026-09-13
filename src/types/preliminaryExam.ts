import { ConfidenceRating } from './assessment';
import { EmpiricalTeachingStyle, ModalityWeights } from './learner';

export type CognitiveProbeType =
  | 'visual_spatial'
  | 'deductive_socratic'
  | 'procedural_practice'
  | 'conceptual_analogy'
  | 'formal_reading'
  | 'metacognitive_calibration';

export interface PreliminaryExamOption {
  id: string;
  text: string;
  isCorrect: boolean;
  diagnosticNote?: string;
}

export interface PreliminaryExamQuestion {
  id: string;
  probeType: CognitiveProbeType;
  probeTitle: string;
  probeDescription: string;
  prompt: string;
  diagramSvgOrAscii?: string;
  codeOrMathSnippet?: string;
  options: PreliminaryExamOption[];
  difficulty: number; // 0.1 to 1.0
  solutionExplanation: string;
  epistemicTakeaway: string;
}

export interface PreliminaryExamAttempt {
  questionId: string;
  probeType: CognitiveProbeType;
  userAnswer: string;
  isCorrect: boolean;
  confidenceRating: ConfidenceRating;
  confidenceScalar: number;
  responseTimeSeconds: number;
}

export interface PreliminaryExamResult {
  empiricalTeachingStyle: EmpiricalTeachingStyle;
  modalityWeights: ModalityWeights;
  baseAbilityTheta: number; // -3.0 to +3.0
  calibratedDifficulty: number; // 0.1 to 1.0
  probeScores: Record<CognitiveProbeType, {
    isCorrect: boolean;
    confidenceScalar: number;
    responseTimeSeconds: number;
    weight: number;
  }>;
  summaryNarrative: string;
  recommendedPedagogyAction: string;
}
