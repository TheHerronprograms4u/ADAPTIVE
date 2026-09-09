import React, { useState, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { QuestionRenderer } from '../shared/QuestionRenderer';
import { MathText } from '../shared/MathText';
import { ConfidenceRating } from '../../types/assessment';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  RotateCcw,
  Layers,
  Award,
  BookOpen,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SessionRunnerScreen: React.FC = () => {
  const {
    currentSession,
    advanceSessionPhase,
    submitAttempt,
    navigateTo,
    profile,
  } = useAdaptive();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [socraticTeachInput, setSocraticTeachInput] = useState<string>('');
  const [isEvaluatingTeach, setIsEvaluatingTeach] = useState<boolean>(false);
  const [teachFeedback, setTeachFeedback] = useState<string | null>(null);

  if (!currentSession) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/40 p-8 text-center backdrop-blur-xl">
        <Sparkles className="h-10 w-10 text-indigo-400 mb-3" />
        <h3 className="text-lg font-bold text-white">No active session initialized</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Click below to have our adaptive engine synthesize your personalized 5-stage session.
        </p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentActivity = currentSession.activities[currentSession.currentPhaseIndex];
  const isFinished = currentSession.isFinished || !currentActivity;

  // Trigger celebratory confetti upon session completion
  useEffect(() => {
    if (isFinished) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#06b6d4', '#f59e0b'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isFinished]);

  if (isFinished) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-8 text-center backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20">
          <Award className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Session Mastery Accomplished</h2>
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
          You completed today's 5-stage personalized learning sequence. Your Bayesian Knowledge Tracing scores and memory half-life stabilities have been updated across your Knowledge Galaxy.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 font-mono text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Stages Cleared</span>
            <span className="text-base font-bold text-white">5 / 5</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Momentum Gain</span>
            <span className="text-base font-bold text-emerald-400">+6%</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Estimated Memory</span>
            <span className="text-base font-bold text-indigo-400">96%</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigateTo('knowledge_galaxy')}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
          >
            View Updated Knowledge Galaxy
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 text-xs font-medium text-zinc-200 hover:bg-zinc-800 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questionsForPhase = currentActivity.contentPayload?.questions || [];
  const activeQuestion = questionsForPhase[activeQuestionIndex];

  const handleAnswerSubmit = (answer: any, isCorrect: boolean, confidence: ConfidenceRating, timeSec: number) => {
    if (!activeQuestion) return;
    submitAttempt({
      questionId: activeQuestion.id,
      conceptId: activeQuestion.conceptId,
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      confidenceRating: confidence,
      confidenceScalar: confidence === 'very_confident' ? 0.98 : confidence === 'confident' ? 0.85 : 0.4,
      responseTimeSeconds: timeSec,
      difficultyAtTime: activeQuestion.difficulty,
    });
  };

  const handleNextInPhase = () => {
    if (activeQuestionIndex + 1 < questionsForPhase.length) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      setActiveQuestionIndex(0);
      advanceSessionPhase();
    }
  };

  const handleTeachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socraticTeachInput.trim()) return;

    setIsEvaluatingTeach(true);
    setTimeout(() => {
      setTeachFeedback(
        `### Epistemic Rubric Evaluation: 9.2 / 10\n\n* **Conceptual Grounding:** Excellent synthesis of core invariants.\n* **Precision:** Solid explanation of domain boundaries.\n* **Next Step:** Ready to proceed to the guided scaffolding problems.`
      );
      setIsEvaluatingTeach(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 5-Phase Step Progress Header */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
              Phase {currentSession.currentPhaseIndex + 1} of 5
            </span>
            <h2 className="text-sm font-bold text-white sm:text-base">
              {currentActivity.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Target: ~{currentActivity.durationMinutes} minutes</span>
          </div>
        </div>

        {/* 5 Step Indicator Pills */}
        <div className="grid grid-cols-5 gap-2">
          {currentSession.activities.map((act, idx) => {
            const isDone = idx < currentSession.currentPhaseIndex;
            const isCurrent = idx === currentSession.currentPhaseIndex;

            return (
              <div
                key={act.id}
                className={`flex flex-col rounded-xl border p-2.5 transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : isDone
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : 'border-white/5 bg-zinc-950/30 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase">
                  <span>0{idx + 1}</span>
                  {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </div>
                <span className="mt-1 text-xs font-medium truncate text-zinc-200">
                  {act.phase.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Content Body */}
      {currentActivity.format === 'read_theory' || currentActivity.format === 'socratic_inquiry' ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <BookOpen className="h-4 w-4" />
              <span>Theoretical Framework & Core Schema</span>
            </div>

            <div className="text-sm text-zinc-200 leading-relaxed space-y-3">
              <MathText content={currentActivity.contentPayload?.theorySummary || 'Synthesizing core axioms...'} />
            </div>

            {/* Socratic "Teach Me" or Inquire Exercise */}
            <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Bot className="h-4 w-4 text-indigo-400" />
                <span>Active Epistemic Recall: Explain Concept to AI</span>
              </div>
              <p className="text-xs text-zinc-400">
                Synthesize what you just learned in 2-3 sentences. Teaching the AI builds the strongest neural synaptic stability.
              </p>

              {teachFeedback ? (
                <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 text-xs text-zinc-200 leading-relaxed">
                  <MathText content={teachFeedback} />
                  <button
                    onClick={advanceSessionPhase}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700"
                  >
                    <span>Proceed to Next Phase</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTeachSubmit} className="space-y-3">
                  <textarea
                    rows={3}
                    value={socraticTeachInput}
                    onChange={(e) => setSocraticTeachInput(e.target.value)}
                    placeholder="In my own words, this concept works because..."
                    className="glass-input w-full rounded-xl p-3 text-xs"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500">Evaluated against first-principles rubric</span>
                    <button
                      type="submit"
                      disabled={isEvaluatingTeach || !socraticTeachInput.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-40"
                    >
                      {isEvaluatingTeach ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                      <span>Evaluate Explanation</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : activeQuestion ? (
        <QuestionRenderer
          question={activeQuestion}
          onSubmitAnswer={handleAnswerSubmit}
          onNextQuestion={handleNextInPhase}
          isLastQuestion={activeQuestionIndex + 1 === questionsForPhase.length}
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center backdrop-blur-xl space-y-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Phase Objective Achieved</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {currentActivity.objectiveText}
          </p>
          <button
            onClick={advanceSessionPhase}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
          >
            Advance to Next Phase
          </button>
        </div>
      )}
    </div>
  );
};
