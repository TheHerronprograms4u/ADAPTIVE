import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { getReviewUrgency } from '../../lib/spacedRepetition';
import { ProgressRing } from '../shared/ProgressRing';
import { MathText } from '../shared/MathText';
import {
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Brain,
  Zap,
} from 'lucide-react';

export const ReviewCenterScreen: React.FC = () => {
  const { concepts, userConceptStates, navigateTo, submitAttempt } = useAdaptive();

  const [activeReviewConceptId, setActiveReviewConceptId] = useState<string | null>(null);
  const [activePromptIndex, setActivePromptIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Sort concepts by retention decay urgency (lowest retention first)
  const sortedConcepts = [...concepts].sort((a, b) => {
    const rA = userConceptStates[a.id]?.retentionScore || 0.8;
    const rB = userConceptStates[b.id]?.retentionScore || 0.8;
    return rA - rB;
  });

  const dueConcepts = sortedConcepts.filter(c => (userConceptStates[c.id]?.retentionScore || 1.0) < 0.85);

  const activeReviewConcept = concepts.find(c => c.id === activeReviewConceptId) || null;

  const handleScoreReview = (wasEasy: boolean) => {
    if (!activeReviewConcept) return;

    submitAttempt({
      questionId: `review-q-${activeReviewConcept.id}`,
      conceptId: activeReviewConcept.id,
      userAnswer: wasEasy ? 'Mastered retrieval' : 'Partial recall',
      isCorrect: wasEasy,
      score: wasEasy ? 1.0 : 0.6,
      confidenceRating: wasEasy ? 'very_confident' : 'somewhat_confident',
      confidenceScalar: wasEasy ? 0.95 : 0.60,
      responseTimeSeconds: 8,
      difficultyAtTime: activeReviewConcept.difficultyBase,
    });

    setIsRevealed(false);
    setActiveReviewConceptId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>FSRS Half-Life Spaced Repetition</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Active Spaced Review Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Intelligently timed active recall cards based on exponential memory decay curves. Reviewing before forgetting cements neural stability.
          </p>
        </div>

        {dueConcepts.length > 0 && (
          <button
            onClick={() => setActiveReviewConceptId(dueConcepts[0].id)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 px-5 py-3 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>Review Top Due Concept</span>
          </button>
        )}
      </div>

      {/* Active Flash-Scenario Review Modal / Drawer */}
      {activeReviewConcept && (
        <div className="rounded-3xl border border-amber-500/40 bg-zinc-900/95 p-6 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase">Active Retrieval Test</span>
                <h3 className="text-base font-bold text-white">{activeReviewConcept.name}</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveReviewConceptId(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-200">
              Recall from memory: What is the fundamental invariant or core formula of this concept?
            </h4>
            <p className="text-xs text-zinc-400 italic">
              Try to explain the mechanism in your head before clicking "Reveal Answer".
            </p>
          </div>

          {isRevealed ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-xs text-zinc-200 leading-relaxed space-y-2">
                <span className="font-semibold text-indigo-300 block">Core Theory:</span>
                <MathText content={activeReviewConcept.summary} />
                {activeReviewConcept.keyFormulas && activeReviewConcept.keyFormulas.length > 0 && (
                  <div className="pt-2 text-indigo-200 font-serif">
                    <MathText content={`$$${activeReviewConcept.keyFormulas[0]}$$`} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleScoreReview(false)}
                  className="flex-1 rounded-xl border border-rose-500/40 bg-rose-950/20 py-3 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer"
                >
                  Struggled to Recall (Reset Stability)
                </button>
                <button
                  onClick={() => handleScoreReview(true)}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  Recalled Cleanly (+2.5x Stability)
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
            >
              <span>Reveal Solution & Epistemic Answer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Due Concepts Queue */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Personalized Spaced Repetition Queue</span>
          <span className="text-xs text-zinc-400 font-mono font-normal">
            {dueConcepts.length} concepts requiring reinforcement
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedConcepts.map((concept) => {
            const state = userConceptStates[concept.id] || {
              masteryScore: 0.5,
              retentionScore: 0.8,
              stabilityDays: 3.0,
            };

            const urgency = getReviewUrgency(state.retentionScore);

            return (
              <div
                key={concept.id}
                className="flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-950/50 p-4 transition-all hover:border-white/15 hover:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-indigo-400">
                      {concept.shortCode}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${urgency.badgeColor}`}>
                      {(state.retentionScore * 100).toFixed(0)}% retention
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-white">{concept.name}</h4>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{concept.summary}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500">
                    Stability: <span className="font-mono text-zinc-300">{state.stabilityDays.toFixed(1)}d</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveReviewConceptId(concept.id);
                      setIsRevealed(false);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Review</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
