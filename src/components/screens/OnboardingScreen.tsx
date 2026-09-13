import React, { useState, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { EducationLevel, GoalType } from '../../types/learner';
import { PreliminaryExamScreen } from './PreliminaryExamScreen';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  GraduationCap,
  BookOpen,
  Brain,
  Wand2,
  Loader2,
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    subjects,
    activeSubjectId,
    setActiveSubjectId,
    createCustomTopic,
    isGeneratingTopic,
  } = useAdaptive();

  const [step, setStep] = useState<number>(profile.preliminaryExamTaken ? 3 : 1);
  const [name, setName] = useState<string>(profile.name !== 'Learner' ? profile.name : '');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(profile.educationLevel || 'high_school');
  const [targetGoal, setTargetGoal] = useState<GoalType>(profile.targetGoal || 'master_subject');
  const [sessionMinutes, setSessionMinutes] = useState<number>(profile.preferredSessionMinutes || 25);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || 'subj-math-alg');

  // Custom "learn anything" topic state
  const [showCustomTopic, setShowCustomTopic] = useState<boolean>(false);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customTopicDetails, setCustomTopicDetails] = useState<string>('');

  // If the cloud profile finishes loading after mount and shows the exam was already
  // taken, jump straight to the calibrated findings instead of forcing a retake.
  useEffect(() => {
    if (profile.preliminaryExamTaken && step === 1) {
      setStep(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.preliminaryExamTaken]);

  const handleProceedToExam = () => {
    updateProfile({
      name: name.trim() || 'Learner',
      educationLevel,
      targetGoal,
      preferredSessionMinutes: sessionMinutes,
      primarySubjectId: selectedSubjectId,
    });
    setActiveSubjectId(selectedSubjectId);
    setStep(2);
  };

  const handleGenerateCustomTopic = async () => {
    if (!customTopic.trim() || isGeneratingTopic) return;
    try {
      const created = await createCustomTopic(customTopic.trim(), customTopicDetails.trim() || undefined);
      if (created) {
        updateProfile({ primarySubjectId: created.id });
        setStep(2);
      }
    } catch (err) {
      console.warn('Custom topic generation failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 pb-16 animate-in fade-in duration-200">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
            Step {step} of 3
          </span>
          <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {step === 1
              ? 'Academic Profile & What You Want to Learn'
              : step === 2
              ? 'Preliminary Cognitive Diagnostic Exam'
              : 'Empirically Calibrated Teaching Style'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-indigo-500' : s < step ? 'w-2 bg-emerald-400' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Academic Level & Subject Selection */}
      {step === 1 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6 text-left">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Learner Preferred Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Academic Grade Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Academic & Grade Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'elementary', label: 'Elementary / Primary' },
                { id: 'middle_school', label: 'Middle School (6-8)' },
                { id: 'high_school', label: 'High School (9-12)' },
                { id: 'ap_honors', label: 'AP / Honors / IB' },
                { id: 'undergraduate', label: 'College / University' },
                { id: 'graduate', label: 'Graduate / Master / PhD' },
                { id: 'professional', label: 'Professional / Career' },
                { id: 'lifelong_learner', label: 'Lifelong Self-Learner' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEducationLevel(lvl.id as EducationLevel)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    educationLevel === lvl.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                      : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="font-medium text-[11px] block">{lvl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Starting Course */}
          {!showCustomTopic && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Select Starting School Subject
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      selectedSubjectId === s.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                        : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
                        style={{ backgroundColor: `${s.accentColor}25`, color: s.accentColor }}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{s.name}</span>
                        <span className="text-[10px] text-zinc-400">{s.gradeLevel || 'Universal'}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom "Learn Anything" Topic Generator */}
          {showCustomTopic && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                What Do You Want to Learn? (Any Topic, Any Skill)
              </label>
              <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Wand2 className="h-4 w-4 text-purple-400" />
                  <span>Universal AI Curriculum Synthesizer</span>
                </div>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Guitar Theory, Quantum Computing, Korean Cooking, Real Estate Investing, Chess Openings..."
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                />
                <textarea
                  rows={2}
                  value={customTopicDetails}
                  onChange={(e) => setCustomTopicDetails(e.target.value)}
                  placeholder="Optional: your current level, specific focus areas, or goals for this topic..."
                  className="glass-input w-full p-3 text-xs"
                />
                <button
                  type="button"
                  onClick={handleGenerateCustomTopic}
                  disabled={!customTopic.trim() || isGeneratingTopic}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 cursor-pointer transition-all"
                >
                  {isGeneratingTopic ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Your Personal Knowledge Galaxy...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate My Personal Learning Track</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Toggle between catalog and custom topic */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowCustomTopic(prev => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {showCustomTopic
                ? '← Back to School Subject Catalog'
                : '✦ Or learn something else entirely (any topic)'}
            </button>
          </div>

          {/* Goal */}
          {!showCustomTopic && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Primary Learning Objective
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'master_subject', label: 'Deep Subject Mastery (First Principles)', icon: Target },
                  { id: 'pass_exam', label: 'Pass Upcoming School / AP / SAT Exam', icon: GraduationCap },
                  { id: 'improve_grades', label: 'Strengthen Weak Prerequisite Grades', icon: Sparkles },
                  { id: 'learn_skill', label: 'Acquire Technical & Problem-Solving Fluency', icon: Zap },
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setTargetGoal(g.id as GoalType)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        targetGoal === g.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                          : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="font-medium text-xs">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Session Length */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Daily Target Session Length: <span className="font-mono text-indigo-300 font-bold">{sessionMinutes} mins</span>
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-center gap-3">
            <Brain className="h-5 w-5 text-indigo-400 shrink-0" />
            <p className="text-xs text-zinc-300 leading-relaxed">
              Next, you will take a brief <strong>6-question Preliminary Cognitive Assessment</strong>. The platform will empirically measure your visual, deductive, procedural, and analogy problem-solving to determine the optimal teaching style for <strong>{customTopic.trim() || 'your chosen subject'}</strong>.
            </p>
          </div>

          <button
            onClick={handleProceedToExam}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 py-4 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
          >
            <span>Launch Preliminary Diagnostic Battery</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Preliminary Cognitive Diagnostic Assessment Battery */}
      {step === 2 && (
        <PreliminaryExamScreen onComplete={() => setStep(3)} />
      )}

      {/* Step 3: Empirical Findings (If loaded directly into Step 3) */}
      {step === 3 && (
        <PreliminaryExamScreen />
      )}
    </div>
  );
};
