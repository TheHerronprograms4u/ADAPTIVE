import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearnerProfile, CognitiveMilestone } from '../types/learner';
import { Subject, Concept, UserConceptState } from '../types/subject';
import { Question, UserAttempt, DiagnosticAssessmentState, ConfidenceRating } from '../types/assessment';
import { DynamicLearningSession, AdaptiveRecommendation } from '../types/engine';
import { UploadedDocument, ExamPreparationPlan } from '../types/document';
import { SCHOOL_SUBJECTS } from '../data/schoolSubjects';
import { DEFAULT_CONCEPTS, DEFAULT_QUESTIONS } from '../data/defaultCurriculum';
import {
  calculateBKTUpdate,
  determineMasteryTier,
  confidenceRatingToScalar,
  calculateCalibrationScore,
  computeContinuousDifficulty,
  evaluatePreliminaryExam,
} from '../lib/learningEngine';
import { processSpacedRepetitionReview } from '../lib/spacedRepetition';
import { classifyUserError } from '../lib/misconceptionClassifier';
import { computeNextBestLearningAction } from '../lib/recommendationEngine';
import { generatePersonalizedSession } from '../lib/sessionGenerator';
import { soundEffects } from '../lib/audioEffects';
import { generateSchoolSubjectCurriculum } from '../lib/groq';
import { PreliminaryExamAttempt, PreliminaryExamResult } from '../types/preliminaryExam';
import { supabase, syncProfileToSupabase, fetchProfileFromSupabase, syncConceptStatesToSupabase, saveAttemptToSupabase, saveDocumentToSupabase } from '../lib/supabase';

export type ScreenName = 
  | 'splash'
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'preliminary_exam'
  | 'diagnostic'
  | 'dashboard'
  | 'session'
  | 'lesson'
  | 'practice'
  | 'quiz'
  | 'tutor'
  | 'knowledge_galaxy'
  | 'concept_detail'
  | 'analytics'
  | 'study_planner'
  | 'exam_mode'
  | 'exam_report'
  | 'review_center'
  | 'achievements'
  | 'profile'
  | 'settings'
  | 'document_import'
  | 'study_guide'
  | 'focus_mode';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'retention' | 'mastery' | 'system' | 'streak';
  timestamp: string;
  isRead: boolean;
  actionScreen?: ScreenName;
  actionConceptId?: string;
}

interface AdaptiveContextType {
  currentScreen: ScreenName;
  navigateTo: (screen: ScreenName, params?: { conceptId?: string }) => void;
  profile: LearnerProfile;
  updateProfile: (partial: Partial<LearnerProfile>) => void;
  subjects: Subject[];
  activeSubjectId: string;
  setActiveSubjectId: (id: string) => void;
  activeSubject: Subject;
  concepts: Concept[];
  questions: Question[];
  userConceptStates: Record<string, UserConceptState>;
  userAttempts: UserAttempt[];
  selectedConceptId: string | null;
  setSelectedConceptId: (id: string | null) => void;
  selectedConcept: Concept | null;

  // Preliminary Diagnostic Exam & Empirical Modalities
  preliminaryAttempts: PreliminaryExamAttempt[];
  preliminaryResult: PreliminaryExamResult | null;
  submitPreliminaryAttempt: (attempt: PreliminaryExamAttempt) => void;
  finishPreliminaryExam: () => PreliminaryExamResult;

  // School Curriculum & Custom Subject Generation
  createCustomSchoolSubject: (name: string, gradeLevel: string, description?: string) => Promise<Subject>;
  createCustomTopic: (topic: string, description?: string) => Promise<Subject>;
  isGeneratingTopic: boolean;
  switchSubject: (subjectId: string) => void;
  isSubjectSelectorOpen: boolean;
  setIsSubjectSelectorOpen: (open: boolean) => void;
  
  // Dynamic Session
  currentSession: DynamicLearningSession | null;
  startDynamicSession: () => void;
  advanceSessionPhase: () => void;
  
  // Diagnostic
  diagnosticState: DiagnosticAssessmentState | null;
  startDiagnostic: (subjectId: string) => void;
  submitDiagnosticAnswer: (answer: any, confidence: ConfidenceRating, responseTimeSec: number) => void;
  finishDiagnostic: () => void;
  
  // Learning Engine Submissions
  submitAttempt: (attempt: Omit<UserAttempt, 'id' | 'timestamp' | 'userId'>) => void;
  
  // Recommendation
  nextBestAction: AdaptiveRecommendation;
  
  // Notifications & Command Palette
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isFocusModeActive: boolean;
  toggleFocusMode: () => void;
  
  // Document Import & Planner
  uploadedDocuments: UploadedDocument[];
  addUploadedDocument: (doc: UploadedDocument) => void;
  activeExamPlan: ExamPreparationPlan | null;
  setActiveExamPlan: (plan: ExamPreparationPlan | null) => void;
  
  // Authentication & Session
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isAuthChecking: boolean;
  signOut: () => Promise<void>;

  // Milestones
  milestones: CognitiveMilestone[];
  resetAllData: () => void;
}

const INITIAL_PROFILE: LearnerProfile = {
  id: '',
  name: 'Learner',
  avatarSeed: 'learner',
  educationLevel: 'high_school',
  primarySubjectId: 'subj-math-alg',
  targetGoal: 'master_subject',
  preferredSessionMinutes: 25,
  pacePreference: 'balanced',
  modalities: {
    visual: 0.8,
    reading: 0.7,
    practice: 0.9,
    interactive: 0.8,
    socratic: 0.75,
    directExplanation: 0.8,
    analogies: 0.85,
  },
  preliminaryExamTaken: false,
  overallMastery: 0.0,
  overallRetention: 1.0,
  learningMomentum: 0,
  calibrationScore: 0,
  currentStreakDays: 0,
  totalStudyMinutes: 0,
  conceptsMasteredCount: 0,
  totalAttemptsCount: 0,
  accuracyRate: 0.0,
  averageResponseTimeSeconds: 0,
  personaType: 'analytical',
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

function generateInitialStates(): Record<string, UserConceptState> {
  const map: Record<string, UserConceptState> = {};
  DEFAULT_CONCEPTS.forEach((c) => {
    map[c.id] = {
      userId: '',
      conceptId: c.id,
      masteryScore: 0.0,
      confidenceScore: 0.5,
      retentionScore: 1.0,
      masteryTier: 'novice',
      stabilityDays: 1.0,
      difficultyRating: c.difficultyBase,
      repsCount: 0,
      lapsesCount: 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      forgettingProbability: 0.0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracyRate: 0.0,
      averageResponseTimeSeconds: 0,
      last5Accuracy: [],
      misconceptionHistory: [],
      isPrerequisiteBottleneck: false,
      recommendedNextAction: 'learn',
    };
  });
  return map;
}

const AdaptiveContext = createContext<AdaptiveContextType | null>(null);

export const AdaptiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('auth');
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem('adaptive_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROFILE;
      }
    }
    return INITIAL_PROFILE;
  });

  // Latest profile reference for the (mount-once) auth listener, without re-subscribing
  const profileRef = React.useRef(profile);
  React.useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('adaptive_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return SCHOOL_SUBJECTS;
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    const saved = localStorage.getItem('adaptive_active_subject_id');
    return saved || 'subj-math-alg';
  });

  const [preliminaryAttempts, setPreliminaryAttempts] = useState<PreliminaryExamAttempt[]>(() => {
    const saved = localStorage.getItem('adaptive_prelim_attempts');
    if (saved) {
      try { return JSON.parse(saved); } catch { // ignore
      }
    }
    return [];
  });

  const [preliminaryResult, setPreliminaryResult] = useState<PreliminaryExamResult | null>(() => {
    const saved = localStorage.getItem('adaptive_prelim_result');
    if (saved) {
      try { return JSON.parse(saved); } catch { // ignore
      }
    }
    return null;
  });

  const [isSubjectSelectorOpen, setIsSubjectSelectorOpen] = useState<boolean>(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState<boolean>(false);
  const [concepts, setConcepts] = useState<Concept[]>(DEFAULT_CONCEPTS);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(DEFAULT_CONCEPTS[0]?.id || null);
  const [userConceptStates, setUserConceptStates] = useState<Record<string, UserConceptState>>(() => {
    const saved = localStorage.getItem('adaptive_concept_states');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return generateInitialStates();
      }
    }
    return generateInitialStates();
  });
  const [userAttempts, setUserAttempts] = useState<UserAttempt[]>([]);
  const [currentSession, setCurrentSession] = useState<DynamicLearningSession | null>(null);
  const [diagnosticState, setDiagnosticState] = useState<DiagnosticAssessmentState | null>(null);
  const [activeExamPlan, setActiveExamPlan] = useState<ExamPreparationPlan | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);

  const milestones: CognitiveMilestone[] = React.useMemo(() => {
    return [
      {
        id: 'mile-prereq-mastery',
        title: 'Foundational Scaffold Architect',
        description: 'Master all essential prerequisites required for advanced differential calculus.',
        category: 'mastery',
        icon: 'Layers',
        progress: Math.min(1.0, profile.conceptsMasteredCount / 6),
        target: 6,
        currentValue: profile.conceptsMasteredCount,
        unit: 'concepts',
        unlockedAt: profile.conceptsMasteredCount >= 6 ? 'Unlocked' : undefined,
      },
      {
        id: 'mile-calibration-master',
        title: 'Epistemic Calibration Master',
        description: 'Achieve a 90%+ calibration score between subjective confidence and objective correctness.',
        category: 'calibration',
        icon: 'Target',
        progress: Math.min(1.0, (profile.calibrationScore || 0) / 90),
        target: 90,
        currentValue: profile.calibrationScore || 0,
        unit: '%',
        unlockedAt: (profile.calibrationScore || 0) >= 90 && profile.totalAttemptsCount >= 5 ? 'Unlocked' : undefined,
      },
      {
        id: 'mile-retrieval-streak',
        title: 'Synaptic Stability Shield',
        description: 'Maintain high memory retention across concepts with consistent daily practice.',
        category: 'retention',
        icon: 'ShieldCheck',
        progress: Math.min(1.0, profile.currentStreakDays / 14),
        target: 14,
        currentValue: profile.currentStreakDays,
        unit: 'days',
        unlockedAt: profile.currentStreakDays >= 14 ? 'Unlocked' : undefined,
      },
      {
        id: 'mile-socratic-scholar',
        title: 'Socratic Epistemic Scholar',
        description: 'Successfully solve and articulate reasoning across 10 problem attempts.',
        category: 'challenge',
        icon: 'GraduationCap',
        progress: Math.min(1.0, profile.totalAttemptsCount / 10),
        target: 10,
        currentValue: profile.totalAttemptsCount,
        unit: 'attempts',
        unlockedAt: profile.totalAttemptsCount >= 10 ? 'Unlocked' : undefined,
      },
      {
        id: 'mile-momentum-titan',
        title: 'Continuous Cognitive Momentum',
        description: 'Maintain an 85%+ learning momentum index during study sprints.',
        category: 'consistency',
        icon: 'Zap',
        progress: Math.min(1.0, (profile.learningMomentum || 0) / 85),
        target: 85,
        currentValue: Math.round(profile.learningMomentum || 0),
        unit: 'index',
        unlockedAt: (profile.learningMomentum || 0) >= 85 ? 'Unlocked' : undefined,
      },
    ];
  }, [profile]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Listen for Supabase Auth State and Initial Session
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setIsAuthenticated(true);
          const cloudProfile = await fetchProfileFromSupabase(session.user.id);
          if (!isMounted) return;

          if (cloudProfile) {
            setProfile(cloudProfile);
          } else {
            setProfile(prev => {
              const updated = {
                ...prev,
                id: session.user.id,
                email: session.user.email || prev.email,
                name: session.user.user_metadata?.name || prev.name || 'Learner',
              };
              syncProfileToSupabase(updated);
              return updated;
            });
          }
          // First-time users must complete the preliminary cognitive exam before anything else
          setCurrentScreen(cloudProfile?.preliminaryExamTaken ? 'dashboard' : 'onboarding');
        } else {
          setIsAuthenticated(false);
          setCurrentScreen('auth');
        }
      } catch (err) {
        console.warn('Supabase auth session check note:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentScreen('auth');
        }
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || Boolean(session?.user)) {
        setIsAuthenticated(true);
        if (session?.user) {
          const cloudProfile = await fetchProfileFromSupabase(session.user.id);
          if (!isMounted) return;

          if (cloudProfile) {
            setProfile(cloudProfile);
          } else {
            setProfile(prev => {
              const updated = {
                ...prev,
                id: session.user.id,
                email: session.user.email || prev.email,
                name: session.user.user_metadata?.name || prev.name || 'Learner',
              };
              syncProfileToSupabase(updated);
              return updated;
            });
          }
        }
        setCurrentScreen(prev => {
          if (prev === 'auth' || prev === 'welcome' || prev === 'splash') {
            // Route through onboarding + preliminary exam for first-time learners
            return profileRef.current.preliminaryExamTaken ? 'dashboard' : 'onboarding';
          }
          return prev;
        });
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuthenticated(false);
        setProfile(INITIAL_PROFILE);
        setCurrentScreen('auth');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage & Supabase only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('adaptive_profile', JSON.stringify(profile));
      syncProfileToSupabase(profile);
    }
  }, [profile, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && profile.id) {
      localStorage.setItem('adaptive_concept_states', JSON.stringify(userConceptStates));
      syncConceptStatesToSupabase(profile.id, userConceptStates);
    }
  }, [userConceptStates, profile.id, isAuthenticated]);

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const selectedConcept = concepts.find(c => c.id === selectedConceptId) || null;

  const navigateTo = (screen: ScreenName, params?: { conceptId?: string }) => {
    if (params?.conceptId) {
      setSelectedConceptId(params.conceptId);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProfile = (partial: Partial<LearnerProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const toggleFocusMode = () => {
    setIsFocusModeActive(prev => !prev);
  };

  // Compute live recommendation
  const nextBestAction = computeNextBestLearningAction(
    activeSubject,
    concepts.filter(c => c.subjectId === activeSubjectId),
    userConceptStates,
    profile
  );

  // Submit learning attempt
  const submitAttempt = (attemptData: Omit<UserAttempt, 'id' | 'timestamp' | 'userId'>) => {
    const concept = concepts.find(c => c.id === attemptData.conceptId);
    const existingState = userConceptStates[attemptData.conceptId] || {
      userId: profile.id,
      conceptId: attemptData.conceptId,
      masteryScore: 0.0,
      confidenceScore: 0.5,
      retentionScore: 1.0,
      masteryTier: 'novice',
      stabilityDays: 1.0,
      difficultyRating: concept?.difficultyBase || 0.5,
      repsCount: 0,
      lapsesCount: 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      forgettingProbability: 0.0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracyRate: 0,
      averageResponseTimeSeconds: 10,
      last5Accuracy: [],
      misconceptionHistory: [],
      isPrerequisiteBottleneck: false,
      recommendedNextAction: 'practice',
    };

    // BKT calculation
    const bktResult = calculateBKTUpdate(
      existingState.masteryScore,
      attemptData.isCorrect,
      attemptData.confidenceScalar,
      attemptData.responseTimeSeconds,
      attemptData.difficultyAtTime
    );

    // Spaced repetition update
    const srResult = processSpacedRepetitionReview(
      existingState,
      attemptData.isCorrect,
      attemptData.confidenceScalar
    );

    // Misconception classification if error
    const questionObj = questions.find(q => q.id === attemptData.questionId);
    let detectedMisc: any = undefined;
    if (!attemptData.isCorrect && questionObj) {
      detectedMisc = classifyUserError(
        questionObj,
        attemptData.userAnswer,
        attemptData.responseTimeSeconds,
        attemptData.confidenceScalar,
        bktResult.wasGuess
      );
      soundEffects.playMisconceptionTone();
    } else if (attemptData.isCorrect) {
      soundEffects.playCorrectChime();
    }

    const fullAttempt: UserAttempt = {
      ...attemptData,
      id: `att-${Date.now()}`,
      userId: profile.id,
      timestamp: new Date().toISOString(),
      wasGuessEstimated: bktResult.wasGuess,
      detectedMisconception: detectedMisc ? {
        category: detectedMisc.category,
        title: detectedMisc.categoryTitle,
        explanation: detectedMisc.diagnosis,
      } : undefined,
    };

    setUserAttempts(prev => [fullAttempt, ...prev]);
    saveAttemptToSupabase(fullAttempt);

    // Check if concept just crossed into mastery
    const oldTier = existingState.masteryTier;
    const newTier = determineMasteryTier(bktResult.newMastery);
    if (newTier === 'mastery' && oldTier !== 'mastery') {
      soundEffects.playMasteryUnlockChime();
    }

    // Update Concept State
    const updatedState: UserConceptState = {
      ...existingState,
      masteryScore: Number(bktResult.newMastery.toFixed(3)),
      confidenceScore: Number(attemptData.confidenceScalar.toFixed(2)),
      retentionScore: srResult.newRetentionScore,
      masteryTier: newTier,
      stabilityDays: srResult.updatedStability,
      difficultyRating: srResult.updatedDifficulty,
      repsCount: existingState.repsCount + 1,
      lapsesCount: attemptData.isCorrect ? existingState.lapsesCount : existingState.lapsesCount + 1,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: srResult.nextReviewDate,
      forgettingProbability: 0.05,
      totalAttempts: existingState.totalAttempts + 1,
      correctAttempts: existingState.correctAttempts + (attemptData.isCorrect ? 1 : 0),
      accuracyRate: (existingState.correctAttempts + (attemptData.isCorrect ? 1 : 0)) / (existingState.totalAttempts + 1),
      averageResponseTimeSeconds: (existingState.averageResponseTimeSeconds * existingState.totalAttempts + attemptData.responseTimeSeconds) / (existingState.totalAttempts + 1),
      last5Accuracy: [...existingState.last5Accuracy.slice(-4), attemptData.isCorrect],
      misconceptionHistory: detectedMisc ? [
        ...existingState.misconceptionHistory,
        { misconceptionId: detectedMisc.category, detectedAt: new Date().toISOString(), resolved: false }
      ] : existingState.misconceptionHistory,
    };

    setUserConceptStates(prev => ({
      ...prev,
      [attemptData.conceptId]: updatedState,
    }));

    // Update Learner Profile Aggregate Metrics
    const allStates = Object.values({ ...userConceptStates, [attemptData.conceptId]: updatedState });
    const avgMastery = allStates.reduce((acc, s) => acc + s.masteryScore, 0) / allStates.length;
    const avgRetention = allStates.reduce((acc, s) => acc + s.retentionScore, 0) / allStates.length;
    const masteredCount = allStates.filter(s => s.masteryTier === 'mastery').length;

    const calibration = calculateCalibrationScore([fullAttempt, ...userAttempts]);

    setProfile(prev => ({
      ...prev,
      overallMastery: Number(avgMastery.toFixed(2)),
      overallRetention: Number(avgRetention.toFixed(2)),
      calibrationScore: calibration.calibrationScore,
      totalAttemptsCount: prev.totalAttemptsCount + 1,
      conceptsMasteredCount: masteredCount,
      accuracyRate: (prev.accuracyRate * prev.totalAttemptsCount + (attemptData.isCorrect ? 1 : 0)) / (prev.totalAttemptsCount + 1),
      learningMomentum: Math.min(100, Math.max(20, prev.learningMomentum + (attemptData.isCorrect ? 2 : -1))),
      lastActiveAt: new Date().toISOString(),
    }));
  };

  // Start Dynamic 5-phase Session
  const startDynamicSession = () => {
    const subjectConcepts = concepts.filter(c => c.subjectId === activeSubjectId);
    if (subjectConcepts.length === 0) {
      // No curriculum for this subject yet: send the learner to generate/switch courses
      setIsSubjectSelectorOpen(true);
      return;
    }
    const session = generatePersonalizedSession(
      activeSubject,
      subjectConcepts,
      userConceptStates,
      profile,
      questions
    );
    setCurrentSession(session);
    navigateTo('session');
  };

  const advanceSessionPhase = () => {
    if (!currentSession) return;
    const nextIdx = currentSession.currentPhaseIndex + 1;
    if (nextIdx < currentSession.activities.length) {
      setCurrentSession({
        ...currentSession,
        currentPhaseIndex: nextIdx,
      });
    } else {
      setCurrentSession({
        ...currentSession,
        isFinished: true,
      });
    }
  };

  // Computerized Adaptive Diagnostic Assessment
  const startDiagnostic = (subjId: string) => {
    // Only use questions whose concept actually belongs to this subject (works for
    // pre-coded and AI-generated subjects alike)
    const subjConceptIds = new Set(concepts.filter(c => c.subjectId === subjId).map(c => c.id));
    const subjQuestions = questions.filter(q => subjConceptIds.has(q.conceptId));
    // Sort starting from moderate difficulty (0.45 - 0.55)
    const initialQuestions = [...subjQuestions].sort((a, b) => Math.abs(a.difficulty - 0.5) - Math.abs(b.difficulty - 0.5));
    
    setDiagnosticState({
      subjectId: subjId,
      currentQuestionIndex: 0,
      totalQuestionsPlanned: Math.min(6, initialQuestions.length),
      questions: initialQuestions,
      responses: [],
      estimatedAbilityTheta: 0.0,
      abilityStandardError: 0.8,
      continuousDifficulty: 0.50,
      isComplete: false,
      detectedWeakPrerequisites: [],
      detectedStrengths: [],
      conceptMasteryMap: {},
    });
    navigateTo('diagnostic');
  };

  const submitDiagnosticAnswer = (answer: any, confidence: ConfidenceRating, responseTimeSec: number) => {
    if (!diagnosticState) return;
    const currentQ = diagnosticState.questions[diagnosticState.currentQuestionIndex];
    if (!currentQ) return;

    let isCorrect = false;
    if (currentQ.type === 'multiple_choice' || currentQ.type === 'code_challenge') {
      const opt = currentQ.options?.find(o => o.id === answer || o.text === answer);
      isCorrect = Boolean(opt?.isCorrect);
    } else if (currentQ.type === 'numerical' && currentQ.numericalAnswer) {
      const numVal = parseFloat(answer);
      isCorrect = Math.abs(numVal - currentQ.numericalAnswer.value) <= currentQ.numericalAnswer.tolerance;
    } else if (currentQ.type === 'matching' || currentQ.type === 'ordering') {
      isCorrect = true; // simplified scoring on multi-match
    } else {
      isCorrect = String(answer).length > 10;
    }

    const confScalar = confidenceRatingToScalar(confidence);
    const attempt: UserAttempt = {
      id: `diag-att-${Date.now()}`,
      userId: profile.id,
      questionId: currentQ.id,
      conceptId: currentQ.conceptId,
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      confidenceRating: confidence,
      confidenceScalar: confScalar,
      responseTimeSeconds: responseTimeSec,
      wasGuessEstimated: isCorrect && confScalar < 0.3 && responseTimeSec < 5,
      timestamp: new Date().toISOString(),
      difficultyAtTime: currentQ.difficulty,
    };

    // Recalculate theta ability and next question difficulty dynamically
    const newTheta = diagnosticState.estimatedAbilityTheta + (isCorrect ? +0.6 : -0.7);
    const nextDiff = computeContinuousDifficulty(diagnosticState.continuousDifficulty, [attempt]);

    const updatedResponses = [...diagnosticState.responses, attempt];
    const isFinished = diagnosticState.currentQuestionIndex + 1 >= diagnosticState.totalQuestionsPlanned;

    const weakPrereqs = [...diagnosticState.detectedWeakPrerequisites];
    const strengths = [...diagnosticState.detectedStrengths];
    if (!isCorrect && currentQ.prerequisiteRefId && !weakPrereqs.includes(currentQ.prerequisiteRefId)) {
      weakPrereqs.push(currentQ.prerequisiteRefId);
    }
    if (isCorrect && !strengths.includes(currentQ.conceptId)) {
      strengths.push(currentQ.conceptId);
    }

    const updatedMasteryMap = { ...diagnosticState.conceptMasteryMap };
    updatedMasteryMap[currentQ.conceptId] = isCorrect ? Math.min(0.95, (updatedMasteryMap[currentQ.conceptId] || 0.5) + 0.25) : Math.max(0.15, (updatedMasteryMap[currentQ.conceptId] || 0.5) - 0.25);

    setDiagnosticState({
      ...diagnosticState,
      currentQuestionIndex: diagnosticState.currentQuestionIndex + 1,
      responses: updatedResponses,
      estimatedAbilityTheta: Number(newTheta.toFixed(2)),
      abilityStandardError: Math.max(0.2, diagnosticState.abilityStandardError - 0.12),
      continuousDifficulty: nextDiff,
      isComplete: isFinished,
      detectedWeakPrerequisites: weakPrereqs,
      detectedStrengths: strengths,
      conceptMasteryMap: updatedMasteryMap,
    });
  };

  const finishDiagnostic = () => {
    if (!diagnosticState) return;
    // Apply diagnostic findings to concept states
    setUserConceptStates(prev => {
      const next = { ...prev };
      Object.entries(diagnosticState.conceptMasteryMap).forEach(([cid, score]) => {
        if (next[cid]) {
          next[cid] = {
            ...next[cid],
            masteryScore: score,
            masteryTier: determineMasteryTier(score),
          };
        }
      });
      return next;
    });
    navigateTo('knowledge_galaxy');
  };

  const submitPreliminaryAttempt = (attempt: PreliminaryExamAttempt) => {
    setPreliminaryAttempts(prev => {
      const filtered = prev.filter(a => a.questionId !== attempt.questionId);
      const updated = [...filtered, attempt];
      localStorage.setItem('adaptive_prelim_attempts', JSON.stringify(updated));
      return updated;
    });
  };

  const finishPreliminaryExam = (): PreliminaryExamResult => {
    const evalResult = evaluatePreliminaryExam(preliminaryAttempts);
    setPreliminaryResult(evalResult);
    localStorage.setItem('adaptive_prelim_result', JSON.stringify(evalResult));

    const updatedProfile: LearnerProfile = {
      ...profile,
      preliminaryExamTaken: true,
      empiricalTeachingStyle: evalResult.empiricalTeachingStyle,
      modalities: evalResult.modalityWeights,
      personaType: evalResult.empiricalTeachingStyle.personaName.toLowerCase().includes('visual') ? 'intuitive' :
                   evalResult.empiricalTeachingStyle.personaName.toLowerCase().includes('socratic') ? 'socratic' :
                   evalResult.empiricalTeachingStyle.personaName.toLowerCase().includes('practitioner') ? 'systematic' :
                   evalResult.empiricalTeachingStyle.personaName.toLowerCase().includes('rigorist') ? 'analytical' : 'experimental',
    };
    setProfile(updatedProfile);
    localStorage.setItem('adaptive_profile', JSON.stringify(updatedProfile));
    if (isAuthenticated) {
      syncProfileToSupabase(updatedProfile);
    }
    return evalResult;
  };

  const switchSubject = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    localStorage.setItem('adaptive_active_subject_id', subjectId);
    const subjConcepts = concepts.filter(c => c.subjectId === subjectId);
    if (subjConcepts.length > 0) {
      setSelectedConceptId(subjConcepts[0].id);
    }
  };

  const buildGeneratedSubject = async (
    name: string,
    gradeLevel: string,
    description?: string,
    isCustomTopic: boolean = false
  ): Promise<Subject> => {
    const generated = await generateSchoolSubjectCurriculum(name, gradeLevel, description);
    
    const newSubjectId = `subj-custom-${Date.now()}`;
    const newSubject: Subject = {
      id: newSubjectId,
      name: generated.subject.name,
      domain: (generated.subject.domain as any) || 'custom_imported',
      description: generated.subject.description,
      icon: 'Sparkles',
      accentColor: generated.subject.accentColor || '#6366f1',
      gradeLevel: generated.subject.gradeLevel,
      topicIds: [`top-${newSubjectId}`],
      totalConcepts: generated.concepts.length,
      isCustom: true,
    };

    if (isCustomTopic) {
      newSubject.description = `Your personal learning track: ${generated.subject.description}`;
    }

    const newConcepts: Concept[] = generated.concepts.map((c, idx) => {
      // Honor AI-declared prerequisites (by name) when they resolve to generated concepts;
      // fall back to a simple linear chain so the knowledge graph is always connected.
      const nameToId = new Map<string, string>();
      generated.concepts.forEach((gc, gIdx) => {
        nameToId.set(gc.name.toLowerCase().trim(), `concept-${newSubjectId}-${gIdx + 1}`);
      });
      const resolvedPrereqIds = (c.prerequisiteNames || [])
        .map(n => nameToId.get(String(n).toLowerCase().trim()))
        .filter((id): id is string => Boolean(id) && id !== `concept-${newSubjectId}-${idx + 1}`);
      const fallbackPrereqIds = idx === 0 ? [] : [`concept-${newSubjectId}-${idx}`];
      const prerequisiteIds = resolvedPrereqIds.length > 0 ? resolvedPrereqIds : fallbackPrereqIds;

      return {
        id: `concept-${newSubjectId}-${idx + 1}`,
        subjectId: newSubjectId,
        topicId: `top-${newSubjectId}`,
        name: c.name,
        shortCode: c.shortCode || `C.${idx + 1}`,
        summary: c.summary,
        detailedTheory: c.detailedTheory,
        keyFormulas: c.keyFormulas || [],
        intuitionAnalogy: c.intuitionAnalogy,
        difficultyBase: typeof c.difficultyBase === 'number' ? c.difficultyBase : 0.5,
        prerequisiteIds,
        visualGalaxyCoords: {
          x: 150 + idx * 120,
          y: 200 + (idx % 2 === 0 ? 50 : -40),
          cluster: newSubjectId,
        },
        misconceptions: (c.misconceptions || []).map((m, mIdx) => ({
          id: `misc-${newSubjectId}-${idx}-${mIdx}`,
          category: 'conceptual_misunderstanding',
          name: m.name,
          description: m.description,
          frequency: 0.4,
          detectedCount: 0,
          remediationAdvice: m.remediationAdvice,
        })),
      };
    });

    const newQuestions: Question[] = generated.questions.map((q, qIdx) => {
      const matchedConcept = newConcepts.find(c => c.name === q.conceptName) || newConcepts[0];
      return {
        id: `q-${newSubjectId}-${qIdx + 1}`,
        conceptId: matchedConcept.id,
        conceptName: matchedConcept.name,
        difficulty: q.difficulty || 0.5,
        discrimination: 1.2,
        type: 'multiple_choice',
        prompt: q.prompt,
        options: q.options.map((opt, oIdx) => ({
          id: opt.id || `opt-${oIdx + 1}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
          misconceptionExplanation: opt.misconceptionExplanation,
        })),
        detailedSolution: q.detailedSolution,
        intuitionTakeaway: q.intuitionTakeaway,
      };
    });

    // Update state & persistence
    setSubjects(prev => {
      const updated = [newSubject, ...prev];
      localStorage.setItem('adaptive_subjects', JSON.stringify(updated));
      return updated;
    });

    setConcepts(prev => [...prev, ...newConcepts]);
    setQuestions(prev => [...prev, ...newQuestions]);

    setUserConceptStates(prev => {
      const updated = { ...prev };
      newConcepts.forEach(c => {
        updated[c.id] = {
          userId: profile.id,
          conceptId: c.id,
          masteryScore: 0.0,
          confidenceScore: 0.5,
          retentionScore: 1.0,
          masteryTier: 'novice',
          stabilityDays: 1.0,
          difficultyRating: c.difficultyBase,
          repsCount: 0,
          lapsesCount: 0,
          lastReviewedAt: new Date().toISOString(),
          nextReviewAt: new Date().toISOString(),
          forgettingProbability: 0.0,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracyRate: 0.0,
          averageResponseTimeSeconds: 0,
          last5Accuracy: [],
          misconceptionHistory: [],
          isPrerequisiteBottleneck: false,
          recommendedNextAction: 'learn',
        };
      });
      localStorage.setItem('adaptive_concept_states', JSON.stringify(updated));
      return updated;
    });

    setActiveSubjectId(newSubjectId);
    setSelectedConceptId(newConcepts[0].id);
    localStorage.setItem('adaptive_active_subject_id', newSubjectId);

    return newSubject;
  };

  const createCustomSchoolSubject = (name: string, gradeLevel: string, description?: string): Promise<Subject> =>
    buildGeneratedSubject(name, gradeLevel, description, false);

  const createCustomTopic = async (topic: string, description?: string): Promise<Subject> => {
    setIsGeneratingTopic(true);
    try {
      return await buildGeneratedSubject(topic, profile.educationLevel === 'lifelong_learner' ? 'Lifelong / Self-Paced' : 'Universal', description, true);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const addUploadedDocument = (doc: UploadedDocument) => {
    setUploadedDocuments(prev => [doc, ...prev]);
    saveDocumentToSupabase(doc);
    // Merge extracted concepts into active concepts
    setConcepts(prev => [...prev, ...doc.extractedConcepts]);
    if (doc.generatedQuestions.length > 0) {
      setQuestions(prev => [...prev, ...doc.generatedQuestions]);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut note:', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('adaptive_profile');
    localStorage.removeItem('adaptive_concept_states');
    const freshProfile = { ...INITIAL_PROFILE, id: 'learner-' + Date.now() };
    const freshStates = generateInitialStates();
    setProfile(freshProfile);
    setUserConceptStates(freshStates);
    setUserAttempts([]);
    setCurrentSession(null);
    setDiagnosticState(null);
    setNotifications([]);
    setCurrentScreen('auth');
  };

  const resetAllData = () => {
    localStorage.removeItem('adaptive_profile');
    localStorage.removeItem('adaptive_concept_states');
    const freshProfile = { ...INITIAL_PROFILE, id: profile.id, email: profile.email, name: profile.name };
    const freshStates = generateInitialStates();
    setProfile(freshProfile);
    setUserConceptStates(freshStates);
    setUserAttempts([]);
    setCurrentSession(null);
    setDiagnosticState(null);
    setNotifications([]);
    if (isAuthenticated) {
      syncProfileToSupabase(freshProfile);
      syncConceptStatesToSupabase(profile.id, freshStates);
    }
    navigateTo('dashboard');
  };

  return (
    <AdaptiveContext.Provider
      value={{
        currentScreen,
        navigateTo,
        profile,
        updateProfile,
        subjects,
        activeSubjectId,
        setActiveSubjectId,
        activeSubject,
        concepts,
        questions,
        userConceptStates,
        userAttempts,
        selectedConceptId,
        setSelectedConceptId,
        selectedConcept,
        preliminaryAttempts,
        preliminaryResult,
        submitPreliminaryAttempt,
        finishPreliminaryExam,
        createCustomSchoolSubject,
        createCustomTopic,
        isGeneratingTopic,
        switchSubject,
        isSubjectSelectorOpen,
        setIsSubjectSelectorOpen,
        currentSession,
        startDynamicSession,
        advanceSessionPhase,
        diagnosticState,
        startDiagnostic,
        submitDiagnosticAnswer,
        finishDiagnostic,
        submitAttempt,
        nextBestAction,
        notifications,
        markNotificationAsRead,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isFocusModeActive,
        toggleFocusMode,
        uploadedDocuments,
        addUploadedDocument,
        activeExamPlan,
        setActiveExamPlan,
        isAuthenticated,
        setIsAuthenticated,
        isAuthChecking,
        signOut,
        milestones,
        resetAllData,
      }}
    >
      {children}
    </AdaptiveContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdaptive = () => {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error('useAdaptive must be used within an AdaptiveProvider');
  }
  return context;
};
