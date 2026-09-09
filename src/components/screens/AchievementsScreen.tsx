import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  Award,
  CheckCircle2,
  Lock,
  Layers,
  Target,
  ShieldCheck,
  GraduationCap,
  Zap,
} from 'lucide-react';

export const AchievementsScreen: React.FC = () => {
  const { milestones, profile } = useAdaptive();

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="h-5 w-5 text-indigo-400" />;
      case 'Target': return <Target className="h-5 w-5 text-cyan-400" />;
      case 'ShieldCheck': return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="h-5 w-5 text-amber-400" />;
      case 'Zap': return <Zap className="h-5 w-5 text-rose-400" />;
      default: return <Award className="h-5 w-5 text-indigo-400" />;
    }
  };

  const unlockedCount = milestones.filter(m => Boolean(m.unlockedAt)).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Award className="h-3.5 w-3.5 text-indigo-400" />
          <span>Epistemic Progression System</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Cognitive Milestones & Mastery Tiers
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Sophisticated, learning-science grounded badges celebrating genuine conceptual breakthroughs rather than superficial gamification.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Unlocked Milestones
          </span>
          <h3 className="mt-2 text-2xl font-bold text-white font-mono">{unlockedCount} / {milestones.length}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Verified competencies</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Active Streak
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <h3 className="text-2xl font-bold text-amber-400 font-mono">{profile.currentStreakDays}</h3>
            <span className="text-xs text-zinc-400">days</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Consistent daily practice</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Mastered Concepts
          </span>
          <h3 className="mt-2 text-2xl font-bold text-emerald-400 font-mono">{profile.conceptsMasteredCount}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">&gt;93% Bayesian Mastery</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Calibration Tier
          </span>
          <h3 className="mt-2 text-2xl font-bold text-indigo-400 font-mono">
            {profile.calibrationScore >= 90
              ? 'Tier I'
              : profile.calibrationScore >= 75
              ? 'Tier II'
              : profile.calibrationScore >= 50
              ? 'Tier III'
              : 'Tier IV'}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">{profile.calibrationScore}% meta-accuracy</p>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {milestones.map((m) => {
          const isUnlocked = Boolean(m.unlockedAt);
          const progressPct = Math.round(m.progress * 100);

          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'border-indigo-500/30 bg-zinc-900/80 shadow-xl'
                  : 'border-white/5 bg-zinc-950/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isUnlocked ? 'bg-indigo-500/20 shadow-md' : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {getMilestoneIcon(m.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500">
                        Category: {m.category}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> In Progress
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-zinc-500">Current Progress</span>
                  <span className="font-mono text-zinc-300">
                    {m.currentValue} / {m.target} {m.unit} ({progressPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isUnlocked ? 'bg-emerald-400' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
