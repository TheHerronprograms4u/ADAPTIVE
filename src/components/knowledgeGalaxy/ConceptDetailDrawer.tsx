import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Concept } from '../../types/subject';
import { MathText } from '../shared/MathText';
import { ProgressRing } from '../shared/ProgressRing';
import {
  X,
  Bot,
  PlayCircle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ConceptDetailDrawerProps {
  concept: Concept | null;
  onClose: () => void;
}

export const ConceptDetailDrawer: React.FC<ConceptDetailDrawerProps> = ({ concept, onClose }) => {
  const { userConceptStates, concepts, navigateTo } = useAdaptive();

  if (!concept) return null;

  const state = userConceptStates[concept.id] || {
    masteryScore: 0.2,
    retentionScore: 0.8,
    stabilityDays: 2.0,
    masteryTier: 'novice',
    totalAttempts: 0,
    accuracyRate: 0,
  };

  const prereqConcepts = concept.prerequisiteIds.map(pid => concepts.find(c => c.id === pid)).filter(Boolean) as Concept[];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-zinc-950/98 p-6 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right duration-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400">
              {concept.shortCode}
            </span>
            <span className="rounded-md border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300">
              {state.masteryTier}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-white tracking-tight">
            {concept.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mastery & Retention Dual Gauges */}
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <ProgressRing
            percentage={state.masteryScore * 100}
            size={72}
            strokeWidth={6}
            colorClass={state.masteryScore >= 0.8 ? 'text-emerald-400' : 'text-indigo-400'}
          />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Bayesian Mastery
            </span>
            <h4 className="text-base font-bold text-white font-mono">
              {(state.masteryScore * 100).toFixed(0)}%
            </h4>
            <p className="text-[10px] text-zinc-500">{state.totalAttempts} attempts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-white/5 pl-3">
          <ProgressRing
            percentage={state.retentionScore * 100}
            size={72}
            strokeWidth={6}
            colorClass={state.retentionScore < 0.6 ? 'text-amber-400' : 'text-cyan-400'}
          />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Memory Half-Life
            </span>
            <h4 className="text-base font-bold text-white font-mono">
              {state.stabilityDays.toFixed(1)}d
            </h4>
            <p className="text-[10px] text-zinc-500">{(state.retentionScore * 100).toFixed(0)}% recall prob</p>
          </div>
        </div>
      </div>

      {/* Core Summary */}
      <div className="mt-5 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Executive Summary
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {concept.summary}
        </p>
      </div>

      {/* Key Formulas in KaTeX */}
      {concept.keyFormulas && concept.keyFormulas.length > 0 && (
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Mathematical Formalisms</span>
          </h3>
          <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3 font-serif space-y-2">
            {concept.keyFormulas.map((f, i) => (
              <div key={i} className="text-xs text-indigo-200">
                <MathText content={`$$${f}$$`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intuition Mental Model */}
      {concept.intuitionAnalogy && (
        <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Lightbulb className="h-4 w-4 text-indigo-400" />
            <span>Intuitive Mental Model</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {concept.intuitionAnalogy}
          </p>
        </div>
      )}

      {/* Prerequisites Chain */}
      <div className="mt-5 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Prerequisite Dependencies
        </h3>
        {prereqConcepts.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No previous prerequisites required (First-principles axiom node).</p>
        ) : (
          <div className="space-y-1.5">
            {prereqConcepts.map((p) => {
              const pState = userConceptStates[p.id];
              const isMastered = (pState?.masteryScore || 0) >= 0.70;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/50 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {isMastered ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    )}
                    <span className="font-medium text-zinc-200">{p.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {Math.round((pState?.masteryScore || 0) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Common Misconceptions to avoid */}
      {concept.misconceptions && concept.misconceptions.length > 0 && (
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>High-Frequency Misconceptions</span>
          </h3>
          <div className="space-y-2">
            {concept.misconceptions.map((m) => (
              <div key={m.id} className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs">
                <div className="font-semibold text-rose-300">{m.name}</div>
                <div className="mt-1 text-zinc-300 leading-relaxed">{m.description}</div>
                <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <span className="font-bold">Antidote: </span> {m.remediationAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Action Triggers */}
      <div className="mt-8 space-y-2.5 pb-6">
        <button
          onClick={() => {
            onClose();
            navigateTo('tutor', { conceptId: concept.id });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Bot className="h-4 w-4" />
          <span>Launch Socratic AI Tutor on this Concept</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              navigateTo('practice', { conceptId: concept.id });
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Practice Problems</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigateTo('review_center', { conceptId: concept.id });
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Spaced Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
