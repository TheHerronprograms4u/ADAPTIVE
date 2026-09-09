import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearnerProfile, ModalityWeights, CognitiveMilestone } from '../types/learner';
import { Subject, Concept, UserConceptState } from '../types/subject';
import { Question, UserAttempt, DiagnosticAssessmentState, ConfidenceRating } from '../types/assessment';
import { DynamicLearningSession, AdaptiveRecommendation } from '../types/engine';
import { UploadedDocument, ExamPreparationPlan } from '../types/document';
import { DEFAULT_SUBJECTS } from '../data/defaultSubjects';
import { DEFAULT_CONCEPTS, DEFAULT_QUESTIONS } from '../data/defaultCurriculum';
import { DEFAULT_MILESTONES } from '../data/defaultMilestones';
import { SIMULATED_PRESETS } from '../data/simulatedProfiles';
import { calculateBKTUpdate, determineMasteryTier, confidenceRatingToScalar, calculateCalibrationScore, computeContinuousDifficulty } from '../lib/learningEngine';
import { calculateCurrentRetention, processSpacedRepetitionReview } from '../lib/spacedRepetition';
import { classifyUserError } from '../lib/misconceptionClassifier';
import { computeNextBestLearningAction } from '../lib/recommendationEngine';
import { generatePersonalizedSession } from '../lib/sessionGenerator';
import { soundEffects } from '../lib/audioEffects';
import { supabase, syncProfileToSupabase, fetchProfileFromSupabase, syncConceptStatesToSupabase, saveAttemptToSupabase, saveDocumentToSupabase } from '../lib/supabase';

export type ScreenName = 
  | 'splash'
  | 'welcome'
  | 'auth'
  | 'onboarding'
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
  
  // Simulated Profiles
  switchSimulatedProfile: (presetKey: 'fast' | 'struggling' | 'overconfident' | 'underconfident') => void;
  
  // Document Import & Planner
  uploadedDocuments: UploadedDocument[];
  addUploadedDocument: (doc: UploadedDocument) => void;
  activeExamPlan: ExamPreparationPlan | null;
  setActiveExamPlan: (plan: ExamPreparationPlan | null) => void;
  
  // Milestones
  milestones: CognitiveMilestone[];
  resetAllData: () => void;
}

const INITIAL_PROFILE: LearnerProfile = {
  id: 'learner-' + Date.now(),
  name: 'Learner',
  avatarSeed: 'learner',
  educationLevel: 'undergraduate',
  primarySubjectId: 'subj-math',
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
  overallMastery: 0.0,
  overallRetention: 1.0,
  learningMomentum: 0,
  calibrationScore: 0,
  currentStreakDays: 1,
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
      userId: 'learner',
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
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem('adaptive_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'learner-1' || parsed.name === 'Harron') {
          localStorage.removeItem('adaptive_profile');
          return INITIAL_PROFILE;
        }
        return parsed;
      } catch {
        return INITIAL_PROFILE;
      }
    }
    return INITIAL_PROFILE;
  });

  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('subj-math');
  const [concepts, setConcepts] = useState<Concept[]>(DEFAULT_CONCEPTS);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>('math-alg-quad');
  const [userConceptStates, setUserConceptStates] = useState<Record<string, UserConceptState>>(() => {
    const saved = localStorage.getItem('adaptive_concept_states');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed['math-alg-quad']?.masteryScore === 0.68) {
          localStorage.removeItem('adaptive_concept_states');
          return generateInitialStates();
        }
        return parsed;
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
  const [milestones, setMilestones] = useState<CognitiveMilestone[]>(DEFAULT_MILESTONES);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Listen for Supabase Auth State and Initial Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfileFromSupabase(session.user.id).then(cloudProfile => {
          if (cloudProfile) {
            setProfile(cloudProfile);
          } else {
            setProfile(prev => {
              const updated = {
                ...prev,
                id: session.user.id,
                email: session.user.email || prev.email,
                name: session.user.user_metadata?.name || prev.name,
              };
              syncProfileToSupabase(updated);
              return updated;
            });
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const cloudProfile = await fetchProfileFromSupabase(session.user.id);
        if (cloudProfile) {
          setProfile(cloudProfile);
        } else {
          setProfile(prev => {
            const updated = {
              ...prev,
              id: session.user.id,
              email: session.user.email || prev.email,
              name: session.user.user_metadata?.name || prev.name,
            };
            syncProfileToSupabase(updated);
            return updated;
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage & Supabase
  useEffect(() => {
    localStorage.setItem('adaptive_profile', JSON.stringify(profile));
    syncProfileToSupabase(profile);
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('adaptive_concept_states', JSON.stringify(userConceptStates));
    syncConceptStatesToSupabase(profile.id, userConceptStates);
  }, [userConceptStates, profile.id]);

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
      masteryScore: 0.2,
      confidenceScore: 0.5,
      retentionScore: 0.8,
      masteryTier: 'novice',
      stabilityDays: 1.5,
      difficultyRating: concept?.difficultyBase || 0.5,
      repsCount: 0,
      lapsesCount: 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      forgettingProbability: 0.2,
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
    const session = generatePersonalizedSession(
      activeSubject,
      concepts.filter(c => c.subjectId === activeSubjectId),
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
    const subjQuestions = questions.filter(q => q.conceptId.startsWith(subjId === 'subj-math' ? 'math' : subjId === 'subj-cs-ai' ? 'cs' : 'math'));
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

  // Switch Simulated Profile
  const switchSimulatedProfile = (presetKey: 'fast' | 'struggling' | 'overconfident' | 'underconfident') => {
    const preset = SIMULATED_PRESETS[presetKey];
    if (!preset) return;
    setProfile(preset.profile);
    setUserConceptStates(prev => {
      const updated = { ...prev };
      Object.entries(preset.conceptStates).forEach(([cid, pstate]) => {
        if (updated[cid]) {
          updated[cid] = { ...updated[cid], ...pstate } as UserConceptState;
        }
      });
      return updated;
    });
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
    syncProfileToSupabase(freshProfile);
    syncConceptStatesToSupabase(profile.id, freshStates);
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
        switchSimulatedProfile,
        uploadedDocuments,
        addUploadedDocument,
        activeExamPlan,
        setActiveExamPlan,
        milestones,
        resetAllData,
      }}
    >
      {children}
    </AdaptiveContext.Provider>
  );
};

export const useAdaptive = () => {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error('useAdaptive must be used within an AdaptiveProvider');
  }
  return context;
};
