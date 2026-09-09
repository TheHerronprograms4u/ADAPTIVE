import { MisconceptionCategory } from './subject';

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'short_answer'
  | 'numerical'
  | 'matching'
  | 'ordering'
  | 'true_false'
  | 'explanation_recall'
  | 'scenario'
  | 'code_challenge';

export type ConfidenceRating = 
  | 'very_unsure'       // 0.1
  | 'unsure'            // 0.3
  | 'somewhat_confident'// 0.6
  | 'confident'         // 0.85
  | 'very_confident';   // 1.0

export interface OptionDistractor {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionCategory?: MisconceptionCategory;
  misconceptionExplanation?: string;
}

export interface MatchingPair {
  leftId: string;
  leftText: string;
  rightId: string;
  rightText: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  correctIndex: number;
}

export interface Question {
  id: string;
  conceptId: string;
  conceptName?: string;
  difficulty: number; // 0.1 to 1.0 continuous scale
  discrimination: number; // IRT discrimination param (default ~1.2)
  type: QuestionType;
  prompt: string;
  contextSnippet?: string;
  diagramSvgOrUrl?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  
  // Choice types
  options?: OptionDistractor[];
  
  // Numerical type
  numericalAnswer?: {
    value: number;
    tolerance: number; // e.g. 0.05
    unit?: string;
  };
  
  // Matching & Ordering
  matchingPairs?: MatchingPair[];
  orderingItems?: OrderingItem[];
  
  // Short answer / explanation
  acceptedKeywords?: string[];
  sampleModelAnswer?: string;
  rubricCriteria?: string[];

  // Explanations & remediation
  detailedSolution: string;
  intuitionTakeaway: string;
  prerequisiteRefId?: string;
}

export interface UserAttempt {
  id: string;
  userId: string;
  questionId: string;
  conceptId: string;
  userAnswer: string | string[] | number | Record<string, string>;
  isCorrect: boolean;
  score: number; // 0.0 to 1.0
  confidenceRating: ConfidenceRating;
  confidenceScalar: number; // 0.1 to 1.0
  responseTimeSeconds: number;
  detectedMisconception?: {
    category: MisconceptionCategory;
    title: string;
    explanation: string;
  };
  wasGuessEstimated?: boolean;
  timestamp: string;
  difficultyAtTime: number;
}

export interface DiagnosticAssessmentState {
  subjectId: string;
  currentQuestionIndex: number;
  totalQuestionsPlanned: number;
  questions: Question[];
  responses: UserAttempt[];
  estimatedAbilityTheta: number; // -3.0 to +3.0 (IRT ability)
  abilityStandardError: number;
  continuousDifficulty: number; // 0.1 to 1.0
  isComplete: boolean;
  detectedWeakPrerequisites: string[];
  detectedStrengths: string[];
  conceptMasteryMap: Record<string, number>;
}
