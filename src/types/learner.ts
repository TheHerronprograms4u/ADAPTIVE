export type EducationLevel = 
  | 'elementary'
  | 'middle_school'
  | 'high_school'
  | 'ap_honors'
  | 'undergraduate'
  | 'graduate'
  | 'professional'
  | 'lifelong_learner';

export type GoalType = 
  | 'pass_exam'
  | 'master_subject'
  | 'improve_grades'
  | 'university_prep'
  | 'learn_skill'
  | 'competition_prep'
  | 'professional_dev'
  | 'curiosity';

export type MasteryTier = 
  | 'novice'       // 0.00 - 0.29
  | 'developing'   // 0.30 - 0.59
  | 'proficient'   // 0.60 - 0.79
  | 'advanced'     // 0.80 - 0.92
  | 'mastery';     // 0.93 - 1.00

export interface ModalityWeights {
  visual: number;          // 0.0 - 1.0
  reading: number;         // 0.0 - 1.0
  practice: number;        // 0.0 - 1.0
  interactive: number;     // 0.0 - 1.0
  socratic: number;        // 0.0 - 1.0
  directExplanation: number;// 0.0 - 1.0
  analogies: number;       // 0.0 - 1.0
}

export interface EmpiricalTeachingStyle {
  personaName: string; // e.g. "Visual-Intuitive Explorer"
  personaTagline: string;
  primaryModality: 'visual' | 'socratic' | 'practice' | 'analogies' | 'reading' | 'interactive';
  secondaryModality: 'visual' | 'socratic' | 'practice' | 'analogies' | 'reading' | 'interactive';
  pedagogyDirective: string;
  defaultTutorMode: 'socratic' | 'explain' | 'simplify' | 'deep_dive' | 'analogy' | 'example';
  scaffoldingLevel: 'high' | 'moderate' | 'minimal';
  brierScore: number;
  epistemicConfidenceBias: 'calibrated' | 'overconfident' | 'underconfident';
  speedAccuracyTradeoff: 'rapid_intuitive' | 'deliberate_rigorous' | 'balanced';
  assessedAt: string;
}

export interface LearnerProfile {
  id: string;
  name: string;
  email?: string;
  avatarSeed: string;
  educationLevel: EducationLevel;
  primarySubjectId: string;
  targetGoal: GoalType;
  examDate?: string; // ISO date string e.g. "2026-10-15"
  examName?: string;
  preferredSessionMinutes: number; // e.g. 15, 25, 45
  pacePreference: 'deliberate' | 'balanced' | 'accelerated';
  modalities: ModalityWeights;
  
  // Preliminary Diagnostic Assessment Status
  preliminaryExamTaken: boolean;
  empiricalTeachingStyle?: EmpiricalTeachingStyle;

  // Dynamic Real-time Estimated Signals
  overallMastery: number; // 0.0 - 1.0
  overallRetention: number; // 0.0 - 1.0
  learningMomentum: number; // 0 - 100%
  calibrationScore: number; // 0 - 100% (accuracy vs confidence alignment)
  currentStreakDays: number;
  totalStudyMinutes: number;
  conceptsMasteredCount: number;
  totalAttemptsCount: number;
  accuracyRate: number; // 0.0 - 1.0
  averageResponseTimeSeconds: number;
  
  // Cognitive & Epistemic profile
  personaType: 'analytical' | 'intuitive' | 'systematic' | 'experimental' | 'socratic';
  
  createdAt: string;
  lastActiveAt: string;
}

export interface CognitiveMilestone {
  id: string;
  title: string;
  description: string;
  category: 'mastery' | 'retention' | 'consistency' | 'calibration' | 'challenge';
  icon: string;
  unlockedAt?: string;
  progress: number; // 0.0 - 1.0
  target: number;
  currentValue: number;
  unit: string;
}
