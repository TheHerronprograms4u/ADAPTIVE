import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  User,
  Sparkles,
  Brain,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { profile } = useAdaptive();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
          <User className="h-3.5 w-3.5 text-indigo-400" />
          <span>Cognitive Profile & Persona</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Learner Epistemic Profile
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Your continuously estimated cognitive fingerprint, including knowledge acquisition velocity, calibration accuracy, and modality weights.
        </p>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono text-xl font-extrabold shadow-lg shadow-indigo-600/30">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30 uppercase">
                {profile.personaType} Persona
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Education: <span className="text-zinc-200 capitalize">{profile.educationLevel.replace('_', ' ')}</span> • Goal:{' '}
              <span className="text-indigo-300 capitalize">{profile.targetGoal.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Streak</span>
            <span className="text-lg font-bold text-amber-400">{profile.currentStreakDays} Days</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Mastery</span>
            <span className="text-lg font-bold text-emerald-400">{Math.round(profile.overallMastery * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Real Cognitive Performance & Diagnostics Metrics */}
      <div className="rounded-3xl border border-indigo-500/30 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Continuous Epistemic Diagnostics</span>
          </h3>
          <span className="text-xs text-indigo-400 font-mono">Live Bayesian Estimation</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Your cognitive profile is calibrated dynamically with every problem attempt, response latency measurement, and confidence rating.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-zinc-200">Problem Accuracy</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{Math.round(profile.accuracyRate * 100)}%</span>
            </div>
            <p className="text-[11px] text-zinc-400">{profile.totalAttemptsCount} total attempts recorded.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-zinc-200">Fluency Latency</span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{profile.averageResponseTimeSeconds > 0 ? `${profile.averageResponseTimeSeconds.toFixed(1)}s` : '—'}</span>
            </div>
            <p className="text-[11px] text-zinc-400">Mean retrieval response time.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-zinc-200">Meta-Calibration</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{profile.calibrationScore > 0 ? `${profile.calibrationScore}%` : '—'}</span>
            </div>
            <p className="text-[11px] text-zinc-400">Subjective confidence vs accuracy alignment.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-zinc-200">Total Focus Time</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">{profile.totalStudyMinutes} mins</span>
            </div>
            <p className="text-[11px] text-zinc-400">{profile.conceptsMasteredCount} concepts fully mastered.</p>
          </div>
        </div>
      </div>

      {/* Modality Spectrum */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-400" />
          <span>Adaptive Modality Weights</span>
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(profile.modalities).map(([mod, weight]) => (
            <div key={mod} className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <span className="text-[10px] font-semibold uppercase text-zinc-400 block truncate">
                {mod}
              </span>
              <span className="mt-1 font-mono text-base font-bold text-indigo-300 block">
                {Math.round(weight * 100)}%
              </span>
              <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${Math.round(weight * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
