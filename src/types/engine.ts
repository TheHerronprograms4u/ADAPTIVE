import { Question } from './assessment';

export type InstructionalFormat = 
  | 'read_theory'
  | 'interactive_simulation'
  | 'guided_practice'
  | 'socratic_inquiry'
  | 'active_recall'
  | 'teach_ai'
  | 'challenge_problem'
  | 'mastery_verification';

export type SessionPhaseType = 
  | 'warm_up'              // 2-3 mins: fading concepts retrieval
  | 'targeted_lesson'      // 6-8 mins: strengthen weak prerequisite or learn next node
  | 'guided_practice'      // 5-7 mins: progressively scaffolded problems
  | 'retrieval_challenge'  // 3-4 mins: interleaved active recall
  | 'mastery_check';       // 2-3 mins: verification assessment

export interface AdaptiveRecommendation {
  conceptId: string;
  conceptName: string;
  topicName: string;
  actionType: 'learn_new' | 'reinforce_prereq' | 'spaced_review' | 'deep_practice' | 'teach_ai_challenge';
  priorityScore: number; // 0.0 to 100.0
  recommendedFormat: InstructionalFormat;
  targetDifficulty: number; // 0.1 to 1.0 continuous
  estimatedMinutes: number;
  explainableReason: string; // The "WHY" (e.g. "Factoring quadratics retention dropped to 41% while completing Calculus prerequisites.")
  prerequisiteGaps: string[];
}

export interface SessionActivity {
  id: string;
  phase: SessionPhaseType;
  title: string;
  durationMinutes: number;
  conceptId: string;
  conceptName: string;
  format: InstructionalFormat;
  targetDifficulty: number;
  objectiveText: string;
  isCompleted: boolean;
  score?: number;
  timeSpentSeconds: number;
  contentPayload?: {
    theorySummary?: string;
    questions?: Question[];
    interactiveType?: string;
    teachPrompt?: string;
  };
}

export interface DynamicLearningSession {
  id: string;
  userId: string;
  subjectId: string;
  generatedAt: string;
  totalPlannedMinutes: number;
  currentPhaseIndex: number;
  activities: SessionActivity[];
  isFinished: boolean;
  accuracyOverall: number;
  adaptationsTriggered: string[]; // Log of real-time mid-session adaptations
}
