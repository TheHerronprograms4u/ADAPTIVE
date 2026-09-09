import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { ProgressRing } from '../shared/ProgressRing';
import { MathText } from '../shared/MathText';
import {
  PlayCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Compass,
  Bot,
  Flame,
  Award,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    profile,
    activeSubject,
    concepts,
    userConceptStates,
    navigateTo,
    startDynamicSession,
    nextBestAction,
    switchSimulatedProfile,
  } = useAdaptive();

  const activeConcepts = concepts.filter(c => c.subjectId === activeSubject.id);

  // Group concepts by health
  const strongConcepts = activeConcepts.filter(c => (userConceptStates[c.id]?.masteryScore || 0) >= 0.80);
  const developingConcepts = activeConcepts.filter(c => {
    const m = userConceptStates[c.id]?.masteryScore || 0;
    return m >= 0.40 && m < 0.80;
  });
  const attentionConcepts = activeConcepts.filter(c => {
    const s = userConceptStates[c.id];
    return !s || s.retentionScore < 0.65 || s.isPrerequisiteBottleneck || s.masteryScore < 0.40;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Briefing Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Learning Operating System</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Your system has prepared today's path.
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              We recalibrated your memory retention curve and prerequisite dependencies overnight. You have{' '}
              <span className="font-semibold text-white">5 active learning milestones</span> queued for{' '}
              <span className="font-semibold text-indigo-300">{activeSubject.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startDynamicSession}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <PlayCircle className="h-5 w-5 fill-current" />
              <span>Start Today's Dynamic Session</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <button
              onClick={() => navigateTo('knowledge_galaxy')}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-5 py-4 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Compass className="h-5 w-5 text-cyan-400" />
              <span>Explore Galaxy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Triad & Momentum Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Learning Momentum */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Learning Momentum
            </span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{profile.learningMomentum}%</h3>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +4% today
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${profile.learningMomentum}%` }}
            />
          </div>
        </div>

        {/* Today's Goal */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Today's Goal
            </span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{profile.preferredSessionMinutes} min</h3>
            <span className="text-xs text-zinc-400">calibrated pace</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">5-stage adaptive distribution</p>
        </div>

        {/* Mastery Ring Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Domain Mastery
            </span>
            <h3 className="mt-2 text-2xl font-bold text-white font-mono">
              {Math.round(profile.overallMastery * 100)}%
            </h3>
            <span className="text-xs text-zinc-400">{profile.conceptsMasteredCount} concepts mastered</span>
          </div>
          <ProgressRing
            percentage={profile.overallMastery * 100}
            size={68}
            strokeWidth={6}
            colorClass="text-emerald-400"
          />
        </div>

        {/* Retention Ring Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Retention Strength
            </span>
            <h3 className="mt-2 text-2xl font-bold text-white font-mono">
              {Math.round(profile.overallRetention * 100)}%
            </h3>
            <span className="text-xs text-zinc-400">Memory stability index</span>
          </div>
          <ProgressRing
            percentage={profile.overallRetention * 100}
            size={68}
            strokeWidth={6}
            colorClass="text-cyan-400"
          />
        </div>
      </div>

      {/* Primary Action Triad Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Continue Learning Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-zinc-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 uppercase">
                Continue Learning
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {Math.round((userConceptStates['math-alg-quad']?.masteryScore || 0.68) * 100)}% mastery
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Quadratic Functions & Factoring</h3>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Second-degree polynomials, parabolas, vertex forms, and algebraic root derivation.
            </p>
          </div>

          <button
            onClick={() => navigateTo('practice', { conceptId: 'math-alg-quad' })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <span>Continue Scaffolding</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 2. High Priority Recommended Review */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-zinc-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 uppercase">
                Recommended Action
              </span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                High Priority
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Review: Linear Equations & Negative Signs</h3>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Retention decayed to 58%. A 3-minute active retrieval prevents negative sign slip contagion into calculus.
            </p>
          </div>

          <button
            onClick={() => navigateTo('review_center', { conceptId: 'math-alg-lin-eq' })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Launch 3-Min Retrieval</span>
          </button>
        </div>

        {/* 3. Diagnostic Challenge Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-zinc-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 uppercase">
                Cognitive Challenge
              </span>
              <span className="text-xs text-zinc-400 font-mono">0.82 Difficulty</span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Can you solve this without calculation?</h3>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Test your intuitive rate-of-change mental model against composite derivative chain rule edge cases.
            </p>
          </div>

          <button
            onClick={() => navigateTo('tutor', { conceptId: 'math-calc-deriv' })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-3 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-all cursor-pointer"
          >
            <Bot className="h-4 w-4" />
            <span>Start AI Challenge Mode</span>
          </button>
        </div>
      </div>

      {/* Explainable AI Decision Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Sparkles className="h-4 w-4" />
          <span>Explainable Adaptive Engine Reasoning</span>
        </div>
        <div className="mt-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="text-sm text-zinc-200 leading-relaxed max-w-3xl">
            <MathText content={nextBestAction.explainableReason} />
          </div>
          <button
            onClick={() => navigateTo('practice', { conceptId: nextBestAction.conceptId })}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white shrink-0 transition-all cursor-pointer"
          >
            Execute Next Best Action →
          </button>
        </div>
      </div>

      {/* Knowledge Health Section */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
          <span>Knowledge Graph Health</span>
          <span className="text-xs font-normal text-zinc-400">Real-time Bayesian Epistemic Model</span>
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Strong */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Strong Mastery ({strongConcepts.length})</span>
            </div>
            <div className="mt-3 space-y-2">
              {strongConcepts.length === 0 ? (
                <p className="text-xs text-zinc-500">None yet</p>
              ) : (
                strongConcepts.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200">{c.name}</span>
                    <span className="font-mono text-emerald-400">
                      {Math.round((userConceptStates[c.id]?.masteryScore || 0) * 100)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Developing */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Developing Proficiency ({developingConcepts.length})</span>
            </div>
            <div className="mt-3 space-y-2">
              {developingConcepts.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200">{c.name}</span>
                  <span className="font-mono text-indigo-300">
                    {Math.round((userConceptStates[c.id]?.masteryScore || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Needs Attention ({attentionConcepts.length})</span>
            </div>
            <div className="mt-3 space-y-2">
              {attentionConcepts.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200">{c.name}</span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300">
                    Prereq / Decay
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
