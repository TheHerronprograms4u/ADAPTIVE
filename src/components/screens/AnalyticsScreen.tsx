import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { generateForgettingCurveData } from '../../lib/spacedRepetition';
import {
  BarChart3,
  TrendingUp,
  Brain,
  Target,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';

const MASTERY_HISTORY_MOCK = [
  { date: 'Day 1', mastery: 32, retention: 85, consistency: 20 },
  { date: 'Day 3', mastery: 44, retention: 78, consistency: 25 },
  { date: 'Day 5', mastery: 56, retention: 82, consistency: 30 },
  { date: 'Day 7', mastery: 64, retention: 88, consistency: 35 },
  { date: 'Day 9', mastery: 72, retention: 86, consistency: 40 },
  { date: 'Day 11', mastery: 74, retention: 91, consistency: 32 },
];

const CALIBRATION_DATA = [
  { confidence: 15, accuracy: 20, count: 4, label: 'Very Unsure' },
  { confidence: 35, accuracy: 38, count: 8, label: 'Unsure' },
  { confidence: 60, accuracy: 65, count: 18, label: 'Moderate' },
  { confidence: 85, accuracy: 84, count: 32, label: 'Confident' },
  { confidence: 98, accuracy: 95, count: 24, label: 'Certain' },
];

export const AnalyticsScreen: React.FC = () => {
  const { profile, concepts, userConceptStates } = useAdaptive();

  const forgettingCurveData = generateForgettingCurveData(12);

  const conceptStrengthData = concepts.map(c => ({
    name: c.shortCode,
    fullName: c.name,
    mastery: Math.round((userConceptStates[c.id]?.masteryScore || 0.2) * 100),
    retention: Math.round((userConceptStates[c.id]?.retentionScore || 0.8) * 100),
    difficulty: Math.round(c.difficultyBase * 100),
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Learning Science & Cognitive Diagnostics</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Progress Analytics & Epistemic Insights
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Empirical estimation of your knowledge growth, memory retention half-life decay, and subjective confidence calibration index.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Calibration Score
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{profile.calibrationScore}%</h3>
            <span className="text-[11px] text-indigo-400 font-semibold">Brier Index</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Accuracy vs confidence alignment</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Total Focus Time
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{profile.totalStudyMinutes}</h3>
            <span className="text-[11px] text-zinc-400">minutes</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{profile.totalAttemptsCount} total problem attempts</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Avg Response Latency
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{profile.averageResponseTimeSeconds.toFixed(1)}s</h3>
            <span className="text-[11px] text-emerald-400">Optimal Fluency</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Procedural schema speed</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Accuracy Yield
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white font-mono">{(profile.accuracyRate * 100).toFixed(0)}%</h3>
            <span className="text-[11px] text-cyan-400">BKT Validated</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">First-attempt success rate</p>
        </div>
      </div>

      {/* Chart Row 1: Mastery Over Time & Forgetting Curve */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mastery Over Time */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Bayesian Mastery Trajectory</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Historical Growth</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MASTERY_HISTORY_MOCK}>
                <defs>
                  <linearGradient id="masteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="mastery" stroke="#10b981" strokeWidth={2.5} fill="url(#masteryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forgetting Curve & Spaced Repetition Boost */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <span>Ebbinghaus Forgetting Curve vs Spaced Repetition</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">30-Day Model</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forgettingCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} label={{ value: 'Days', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 10 }} />
                <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="noReviewRetention" name="Unreviewed Decay" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="spacedReviewRetention" name="ADAPTIVE Spaced Refresh" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Confidence Calibration Scatter & Concept Strength */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Confidence vs Accuracy Calibration */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              <span>Confidence Calibration Curve (Ideal = 45° Line)</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Meta-Cognition</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CALIBRATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="confidence" stroke="#71717a" fontSize={11} label={{ value: 'Reported Confidence %', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 10 }} />
                <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} label={{ value: 'Actual Correctness %', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="accuracy" name="Observed Accuracy" stroke="#818cf8" strokeWidth={3} />
                <Line type="monotone" dataKey="confidence" name="Perfect Calibration" stroke="#52525b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Concept Mastery & Retention Comparison Bar */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>Concept Strength Spectrum</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Mastery vs Retention</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conceptStrengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="mastery" name="Mastery %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retention" name="Retention %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
