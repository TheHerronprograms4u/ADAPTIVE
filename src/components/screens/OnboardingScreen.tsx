import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { EducationLevel, GoalType } from '../../types/learner';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  BookOpen,
  Zap,
  Target,
  GraduationCap,
  Eye,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { profile, updateProfile, subjects, navigateTo, startDiagnostic } = useAdaptive();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(profile.name !== 'Learner' ? profile.name : '');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(profile.educationLevel || 'undergraduate');
  const [targetGoal, setTargetGoal] = useState<GoalType>(profile.targetGoal || 'master_subject');
  const [sessionMinutes, setSessionMinutes] = useState<number>(profile.preferredSessionMinutes || 25);
  const [pace, setPace] = useState<'deliberate' | 'balanced' | 'accelerated'>(profile.pacePreference || 'balanced');

  const [modalities, setModalities] = useState(profile.modalities || {
    visual: 0.85,
    reading: 0.70,
    practice: 0.90,
    interactive: 0.80,
    socratic: 0.75,
    directExplanation: 0.80,
    analogies: 0.85,
  });

  const handleFinish = () => {
    updateProfile({
      name,
      educationLevel,
      targetGoal,
      preferredSessionMinutes: sessionMinutes,
      pacePreference: pace,
      modalities,
    });
    startDiagnostic('subj-math');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 pb-16 animate-in fade-in duration-200">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase">
            Step {step} of 3
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-white tracking-tight">
            {step === 1 ? 'Learner Identity & Academic Level' : step === 2 ? 'Core Educational Objectives' : 'Dynamic Modality Calibrations'}
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

      {/* Step 1: Identity & Academic Level */}
      {step === 1 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Learner Preferred Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harron"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Current Academic & Professional Level
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'high_school', label: 'High School / Secondary' },
                { id: 'undergraduate', label: 'Undergraduate / College' },
                { id: 'graduate', label: 'Graduate / Master / PhD' },
                { id: 'professional', label: 'Professional / Career' },
                { id: 'lifelong_learner', label: 'Lifelong Self-Learner' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEducationLevel(lvl.id as EducationLevel)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    educationLevel === lvl.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                      : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <span>Proceed to Learning Goals</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Goals & Pace */}
      {step === 2 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Primary Target Learning Goal
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'master_subject', label: 'Deep Subject Mastery (First Principles)', icon: Target },
                { id: 'pass_exam', label: 'Pass Upcoming High-Stakes Exam', icon: GraduationCap },
                { id: 'improve_grades', label: 'Strengthen Weak Prerequisite Grades', icon: Sparkles },
                { id: 'professional_dev', label: 'Technical & Professional Skill Acquisition', icon: Zap },
              ].map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setTargetGoal(g.id as GoalType)}
                    className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
                      targetGoal === g.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500'
                        : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Preferred Session Duration: <span className="font-mono text-indigo-300 font-bold">{sessionMinutes} mins</span>
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

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
            >
              <span>Configure Modality Weights</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Modality Weights Configuration */}
      {step === 3 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic Epistemic Modalities</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              We treat your modalities as continuous adaptive Bayesian priors rather than rigid labels.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { key: 'practice', label: 'Active Problem Scaffolding', desc: 'Progressively harder diagnostic problems' },
              { key: 'visual', label: 'Visual Intuition & Diagrams', desc: 'Graphical geometry and coordinate manifolds' },
              { key: 'socratic', label: 'Socratic Inquiry', desc: 'Guiding deductive questions from first principles' },
              { key: 'analogies', label: 'Intuitive Analogies', desc: 'Relatable physical and conceptual models' },
              { key: 'reading', label: 'Theoretical Proofs & Text', desc: 'Rigorous formal axiomatic reading' },
            ].map((mod) => (
              <div key={mod.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{mod.label}</span>
                  <span className="font-mono text-indigo-300">
                    {Math.round((modalities as any)[mod.key] * 100)}% weight
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={(modalities as any)[mod.key]}
                  onChange={(e) =>
                    setModalities(prev => ({
                      ...prev,
                      [mod.key]: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-500"
                />
                <span className="text-[10px] text-zinc-500 block">{mod.desc}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-indigo-700 cursor-pointer"
            >
              <span>Initialize System & Start Diagnostic</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
