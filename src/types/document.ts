import { Concept } from './subject';
import { Question } from './assessment';

export interface UploadedDocument {
  id: string;
  title: string;
  filename: string;
  fileSizeBytes: number;
  uploadedAt: string;
  rawTextPreview: string;
  summary: string;
  extractedConceptsCount: number;
  extractedPrerequisitesCount: number;
  extractedConcepts: Concept[];
  generatedQuestions: Question[];
  studyPlanDays: number;
}

export interface ExamPreparationPlan {
  id: string;
  examName: string;
  targetDate: string;
  daysRemaining: number;
  totalStudyHoursTarget: number;
  readinessProbability: number; // e.g. 84%
  dailyBreakdown: {
    dayNumber: number;
    date: string;
    focusTopic: string;
    targetConcepts: string[];
    estimatedMinutes: number;
    isCompleted: boolean;
    priority: 'critical' | 'high' | 'medium';
    rationale: string;
  }[];
}
