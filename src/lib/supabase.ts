import { createClient } from '@supabase/supabase-js';
import { LearnerProfile } from '../types/learner';
import { UserConceptState } from '../types/subject';
import { UserAttempt } from '../types/assessment';
import { UploadedDocument } from '../types/document';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lyyzygvqepiczlsjipra.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eXp5Z3ZxZXBpY3psc2ppcHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDk5MDYsImV4cCI6MjEwNDUyNTkwNn0.1It549Vyua9PNKZFj3xeE9IjdnH47MifP-mgF0EBtl8';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database Sync Helpers

export async function syncProfileToSupabase(profile: LearnerProfile) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_seed: profile.avatarSeed,
        education_level: profile.educationLevel,
        primary_subject_id: profile.primarySubjectId,
        target_goal: profile.targetGoal,
        exam_date: profile.examDate,
        exam_name: profile.examName,
        preferred_session_minutes: profile.preferredSessionMinutes,
        pace_preference: profile.pacePreference,
        modalities: profile.modalities,
        overall_mastery: profile.overallMastery,
        overall_retention: profile.overallRetention,
        learning_momentum: profile.learningMomentum,
        calibration_score: profile.calibrationScore,
        current_streak_days: profile.currentStreakDays,
        total_study_minutes: profile.totalStudyMinutes,
        concepts_mastered_count: profile.conceptsMasteredCount,
        total_attempts_count: profile.totalAttemptsCount,
        accuracy_rate: profile.accuracyRate,
        average_response_time_seconds: profile.averageResponseTimeSeconds,
        persona_type: profile.personaType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase profile sync note:', error.message);
    }

    return { data, error };
  } catch (err: any) {
    console.warn('Supabase profile sync note:', err.message || err);
    return { data: null, error: err };
  }
}

export async function fetchProfileFromSupabase(userId: string): Promise<LearnerProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarSeed: data.avatar_seed || 'learner',
      educationLevel: data.education_level || 'undergraduate',
      primarySubjectId: data.primary_subject_id || 'subj-math',
      targetGoal: data.target_goal || 'master_subject',
      examDate: data.exam_date,
      examName: data.exam_name,
      preferredSessionMinutes: data.preferred_session_minutes || 25,
      pacePreference: data.pace_preference || 'balanced',
      modalities: data.modalities || {
        visual: 0.8,
        reading: 0.7,
        practice: 0.9,
        interactive: 0.8,
        socratic: 0.75,
        directExplanation: 0.8,
        analogies: 0.85,
      },
      overallMastery: data.overall_mastery ?? 0.0,
      overallRetention: data.overall_retention ?? 1.0,
      learningMomentum: data.learning_momentum ?? 0,
      calibrationScore: data.calibration_score ?? 0,
      currentStreakDays: data.current_streak_days ?? 0,
      totalStudyMinutes: data.total_study_minutes ?? 0,
      conceptsMasteredCount: data.concepts_mastered_count ?? 0,
      totalAttemptsCount: data.total_attempts_count ?? 0,
      accuracyRate: data.accuracy_rate ?? 0.0,
      averageResponseTimeSeconds: data.average_response_time_seconds ?? 0,
      personaType: data.persona_type || 'analytical',
      createdAt: data.created_at || new Date().toISOString(),
      lastActiveAt: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    return null;
  }
}

export async function syncConceptStatesToSupabase(userId: string, states: Record<string, UserConceptState>) {
  if (!isSupabaseConfigured) return;

  try {
    const rows = Object.values(states).map((state) => ({
      user_id: userId,
      concept_id: state.conceptId,
      mastery_score: state.masteryScore,
      confidence_score: state.confidenceScore,
      retention_score: state.retentionScore,
      mastery_tier: state.masteryTier,
      stability_days: state.stabilityDays,
      difficulty_rating: state.difficultyRating,
      reps_count: state.repsCount,
      lapses_count: state.lapsesCount,
      last_reviewed_at: state.lastReviewedAt,
      next_review_at: state.nextReviewAt,
      forgetting_probability: state.forgettingProbability,
      total_attempts: state.totalAttempts,
      correct_attempts: state.correctAttempts,
      accuracy_rate: state.accuracyRate,
      average_response_time_seconds: state.averageResponseTimeSeconds,
      last5_accuracy: state.last5Accuracy,
      misconception_history: state.misconceptionHistory,
      is_prerequisite_bottleneck: state.isPrerequisiteBottleneck,
      recommended_next_action: state.recommendedNextAction,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('user_concept_states')
      .upsert(rows, { onConflict: 'user_id,concept_id' });

    if (error) {
      console.warn('Supabase concept states sync note:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase concept states sync note:', err.message || err);
  }
}

export async function saveAttemptToSupabase(attempt: UserAttempt) {
  if (!isSupabaseConfigured) return;

  try {
    const { error } = await supabase.from('attempts').insert({
      id: attempt.id,
      user_id: attempt.userId,
      question_id: attempt.questionId,
      concept_id: attempt.conceptId,
      is_correct: attempt.isCorrect,
      score: attempt.score,
      user_answer: attempt.userAnswer,
      confidence_rating: attempt.confidenceRating,
      confidence_scalar: attempt.confidenceScalar,
      response_time_seconds: attempt.responseTimeSeconds,
      difficulty_at_time: attempt.difficultyAtTime,
      was_guess_estimated: attempt.wasGuessEstimated,
      detected_misconception: attempt.detectedMisconception,
      timestamp: attempt.timestamp,
    });

    if (error) {
      console.warn('Supabase attempt save note:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase attempt save note:', err.message || err);
  }
}

export async function saveDocumentToSupabase(doc: UploadedDocument) {
  if (!isSupabaseConfigured) return;

  try {
    const { error } = await supabase.from('documents').upsert({
      id: doc.id,
      title: doc.title,
      filename: doc.filename,
      file_size_bytes: doc.fileSizeBytes,
      uploaded_at: doc.uploadedAt,
      raw_text_preview: doc.rawTextPreview,
      summary: doc.summary,
      extracted_concepts_count: doc.extractedConceptsCount,
      extracted_prerequisites_count: doc.extractedPrerequisitesCount,
      extracted_concepts: doc.extractedConcepts,
      generated_questions: doc.generatedQuestions,
      study_plan_days: doc.studyPlanDays,
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase document save note:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase document save note:', err.message || err);
  }
}
