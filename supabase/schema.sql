-- =========================================================
-- Adaptive Learning Platform - Complete Database Schema Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- =========================================================

-- 1. Drop existing tables if re-initializing schema cleanly
-- NOTE: If you have existing data you want to keep, skip the DROP/CREATE block and
-- run only the "Migration for existing databases" section at the bottom instead.
DROP TABLE IF EXISTS public.attempts CASCADE;
DROP TABLE IF EXISTS public.user_concept_states CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Profiles Table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_seed TEXT DEFAULT 'harron',
  education_level TEXT DEFAULT 'undergraduate',
  primary_subject_id TEXT DEFAULT 'subj-math',
  target_goal TEXT DEFAULT 'master_subject',
  exam_date TIMESTAMPTZ,
  exam_name TEXT,
  preferred_session_minutes INT DEFAULT 25,
  pace_preference TEXT DEFAULT 'balanced',
  modalities JSONB DEFAULT '{"visual": 0.8, "reading": 0.7, "practice": 0.9, "interactive": 0.8, "socratic": 0.75, "directExplanation": 0.8, "analogies": 0.85}'::jsonb,
  overall_mastery NUMERIC DEFAULT 0.7,
  overall_retention NUMERIC DEFAULT 0.85,
  learning_momentum NUMERIC DEFAULT 80,
  calibration_score NUMERIC DEFAULT 85,
  current_streak_days INT DEFAULT 1,
  total_study_minutes INT DEFAULT 0,
  concepts_mastered_count INT DEFAULT 0,
  total_attempts_count INT DEFAULT 0,
  accuracy_rate NUMERIC DEFAULT 0.8,
  average_response_time_seconds NUMERIC DEFAULT 12,
  persona_type TEXT DEFAULT 'analytical',
  preliminary_exam_taken BOOLEAN DEFAULT FALSE,
  empirical_teaching_style JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Concept States Table (Tracks continuous BKT & Spaced Repetition parameters)
CREATE TABLE public.user_concept_states (
  user_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  mastery_score NUMERIC DEFAULT 0.2,
  confidence_score NUMERIC DEFAULT 0.2,
  retention_score NUMERIC DEFAULT 1.0,
  mastery_tier TEXT DEFAULT 'novice',
  stability_days NUMERIC DEFAULT 1.0,
  difficulty_rating NUMERIC DEFAULT 0.5,
  reps_count INT DEFAULT 0,
  lapses_count INT DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  forgetting_probability NUMERIC DEFAULT 0.0,
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  accuracy_rate NUMERIC DEFAULT 0.0,
  average_response_time_seconds NUMERIC DEFAULT 0.0,
  last5_accuracy JSONB DEFAULT '[]'::jsonb,
  misconception_history JSONB DEFAULT '[]'::jsonb,
  is_prerequisite_bottleneck BOOLEAN DEFAULT FALSE,
  recommended_next_action TEXT DEFAULT 'learn',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, concept_id)
);

-- 4. Attempts Log Table
CREATE TABLE public.attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score NUMERIC DEFAULT 1.0,
  user_answer JSONB,
  confidence_rating TEXT,
  confidence_scalar NUMERIC,
  response_time_seconds NUMERIC,
  difficulty_at_time NUMERIC,
  was_guess_estimated BOOLEAN,
  detected_misconception JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Uploaded Documents Table
CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filename TEXT,
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  raw_text_preview TEXT,
  summary TEXT,
  extracted_concepts_count INT DEFAULT 0,
  extracted_prerequisites_count INT DEFAULT 0,
  extracted_concepts JSONB DEFAULT '[]'::jsonb,
  generated_questions JSONB DEFAULT '[]'::jsonb,
  study_plan_days INT DEFAULT 7
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_concept_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 7. Create Permissive Policies
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_concept_states" ON public.user_concept_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to attempts" ON public.attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- 8. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

-- =========================================================
-- Migration for existing databases (idempotent — safe to run anytime)
-- If your database was created before the preliminary exam feature,
-- run the two ALTER statements below in the Supabase SQL Editor.
-- They add the columns the app now expects; existing rows are kept.
-- =========================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preliminary_exam_taken BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS empirical_teaching_style JSONB;
NOTIFY pgrst, 'reload schema';
