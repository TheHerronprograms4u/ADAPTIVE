import { MasteryTier } from './learner';

export type SubjectDomain = 
  | 'mathematics'
  | 'science'
  | 'physics_engineering'
  | 'science_biology'
  | 'chemistry'
  | 'computer_science'
  | 'humanities_english'
  | 'history_social_studies'
  | 'foreign_languages'
  | 'economics_business'
  | 'test_prep'
  | 'custom_imported';

export type MisconceptionCategory = 
  | 'calculation_error'
  | 'conceptual_misunderstanding'
  | 'vocabulary_confusion'
  | 'misapplied_formula'
  | 'incorrect_prerequisite'
  | 'pattern_recognition_failure'
  | 'careless_error'
  | 'misinterpretation'
  | 'guessing';

export interface MisconceptionPattern {
  id: string;
  category: MisconceptionCategory;
  name: string;
  description: string;
  frequency: number;
  detectedCount: number;
  lastDetectedAt?: string;
  remediationAdvice: string;
  sampleTriggerSnippet?: string;
}

export interface Concept {
  id: string;
  subjectId: string;
  topicId: string;
  name: string;
  shortCode: string;
  summary: string;
  detailedTheory: string;
  keyFormulas?: string[];
  intuitionAnalogy?: string;
  difficultyBase: number; // 0.1 to 1.0
  prerequisiteIds: string[]; // Concept IDs needed beforehand
  misconceptions: MisconceptionPattern[];
  visualGalaxyCoords: {
    x: number;
    y: number;
    cluster: string;
  };
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  iconName: string;
  conceptIds: string[];
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  domain: SubjectDomain;
  description: string;
  icon: string;
  accentColor: string; // e.g. '#6366f1' or 'indigo'
  gradeLevel?: string; // e.g. "Middle School", "High School / AP", "College"
  topicIds: string[];
  totalConcepts: number;
  isCustom?: boolean;
}

export interface UserConceptState {
  userId: string;
  conceptId: string;
  masteryScore: number; // 0.0 - 1.0
  confidenceScore: number; // 0.0 - 1.0
  retentionScore: number; // 0.0 - 1.0 (estimated current memory strength)
  masteryTier: MasteryTier;
  
  // Spaced Repetition (FSRS / Half-life params)
  stabilityDays: number; // S: memory stability in days
  difficultyRating: number; // D: 0.1 to 1.0
  repsCount: number;
  lapsesCount: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  forgettingProbability: number; // 0.0 to 1.0 (1 - R)
  
  // Attempt signals
  totalAttempts: number;
  correctAttempts: number;
  accuracyRate: number; // 0.0 to 1.0
  averageResponseTimeSeconds: number;
  last5Accuracy: boolean[]; // Recent performance trend
  
  // Diagnostic flags
  misconceptionHistory: {
    misconceptionId: string;
    detectedAt: string;
    resolved: boolean;
  }[];
  
  isPrerequisiteBottleneck: boolean;
  recommendedNextAction: 'learn' | 'strengthen_prereq' | 'practice' | 'review' | 'teach_ai' | 'challenge' | 'mastery_check';
}
